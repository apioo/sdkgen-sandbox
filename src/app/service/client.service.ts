import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {ConfigService} from "./config.service";
import {Document as Doc} from "./document.service";

@Injectable({
  providedIn: 'root',
})
export class ClientService {

  constructor(private httpClient: HttpClient, private config: ConfigService) {
  }

  public getTypes(): Promise<Array<Type>> {
    return new Promise((resolve, reject) => {
      this.httpClient.get<Collection>('https://api.sdkgen.app/types').subscribe({
        next: data => {
          const types = data.types.filter((type) => {
            return type.name.startsWith('model-');
          });
          resolve(types);
        },
        error: err => {
          reject(err);
        }
      })
    });
  }

  public async generate(doc: Doc, spec: object): Promise<Message> {
    let params = new HttpParams();
    if (doc.namespace) {
      params = params.append('namespace', doc.namespace);
    }

    if (doc.baseUrl) {
      params = params.append('baseUrl', doc.baseUrl);
    }

    let headers = new HttpHeaders();
    const accessToken = await this.obtainAccessToken();
    if (accessToken) {
      headers = headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const targetFolder = doc.targetFolder;
    if (targetFolder && window.fusio) {
      return new Promise((resolve, reject) => {
        this.httpClient.post<Response>('https://api.sdkgen.app/generate/' + doc.type, spec, { headers, params }).subscribe({
          next: async (data: Response) => {
            const files: Array<{ file: string, content: string }> = [];

            if (data.chunks) {
              Object.entries(data.chunks).forEach(([file, content]) => {
                files.push({
                  file: file,
                  content: content,
                });

              });
            } else if (data.output) {
              const extension = this.getFileExtensionByType(doc.type);

              files.push({
                file: `output.${extension}`,
                content: data.output,
              });
            }

            const result = await window.fusio.writeModels(targetFolder, files);
            if (result.success) {
              resolve({
                success: true,
                message: 'Generated successfully',
              });
            } else {
              resolve({
                success: false,
                message: result.error || 'An unknown error occurred',
              });
            }
          },
          error: (error) => {
            resolve(this.convertError(error));
          }
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        this.httpClient.post('https://api.sdkgen.app/download/' + doc.type, spec, {responseType: 'blob', headers, params}).subscribe({
          next: (data: Blob) => {
            const downloadUrl = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = this.getFileNameByType(doc.type);
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(downloadUrl);

            resolve({
              success: true,
              message: 'Generated successfully',
            });
          },
          error: (error) => {
            resolve(this.convertError(error));
          }
        });
      });
    }
  }

  private async convertError(error: any): Promise<Message> {
    if (error.error) {
      const response = error.error;
      if (typeof response === 'object') {
        if (response instanceof Blob) {
          return this.convertError(await this.readErrorFromBlob(response));
        }

        if (response.message) {
          return {
            success: false,
            message: response.message,
          };
        } else {
          return {
            success: false,
            message: JSON.stringify(response),
          };
        }
      }
    }

    return this.readErrorFromString(String(error));
  }

  private readErrorFromString(response: string): Message {
    const result = JSON.parse(response);
    if (typeof result === 'object' && result.message) {
      return {
        success: false,
        message: result.message,
      };
    } else {
      return {
        success: false,
        message: response,
      };
    }
  }

  private async readErrorFromBlob(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(reader.result as string);
        } catch (error) {
          resolve(String(error));
        }
      };

      reader.readAsText(blob);
    });
  }

  private getFileNameByType(type: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const dateSuffix = `${year}-${month}-${day}-${hours}-${minutes}`;
    const extension = this.getFileExtensionByType(type);

    return `${type}-${dateSuffix}.${extension}`;
  }

  private getFileExtensionByType(type: string): string {
    let extension = 'zip';
    if (type === 'markup-client') {
      extension = 'ts';
    } else if (type === 'markup-html') {
      extension = 'html';
    } else if (type === 'markup-markdown') {
      extension = 'md';
    } else if (type.startsWith('model-jsonschema')) {
      extension = 'json';
    } else if (type === 'spec-graphql') {
      extension = 'graphql';
    } else if (type === 'spec-openapi' || type === 'spec-openrpc' || type === 'spec-typeapi') {
      extension = 'json';
    }

    return extension;
  }

  private async obtainAccessToken(): Promise<string|null> {
    const config = this.config.load();
    if (!config.clientId || !config.clientSecret) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const body = new HttpParams().set('grant_type', 'client_credentials');

      const headers = new HttpHeaders({
        'Authorization': 'Basic ' + btoa(config.clientId + ':' + config.clientSecret),
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      this.httpClient.post('https://api.sdkgen.app/authorization/token', body.toString(), { headers }).subscribe({
        next: (data: any) => {
          if (data && data.access_token) {
            resolve(data.access_token);
          } else {
            resolve(null);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

}

export interface Collection {
  types: Array<Type>
}

export interface Type {
  name: string,
  fileExtension: string,
  mime: string,
}

interface Response {
  chunks: Record<string, string>;
  output?: string;
}

export interface Message {
  success: boolean;
  message: string;
}
