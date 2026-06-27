import {Injectable} from "@angular/core";
import {Specification} from "ngx-typeschema-editor";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private documents: Array<Document> = [];

  public loadFromStorage() {
    const rawDocuments = localStorage.getItem('documents');
    if (rawDocuments) {
      this.documents = JSON.parse(rawDocuments);
    }
  }

  public getAll(): Array<Document> {
    return this.documents;
  }

  public get(index: number): Document|undefined {
    return this.documents[index];
  }

  public create(name: string, type: string): number {
    const spec = {
      imports: [],
      operations: [],
      types: [{
        name: name,
        description: '',
        type: 'struct',
        properties: [],
      }],
      root: 0,
    };

    const index = this.documents.push({
      name: name,
      type: type,
      spec: spec,
    });

    this.persist();

    return index - 1;
  }

  public update(index: number, type?: string, namespace?: string, baseUrl?: string, targetFolder?: string, spec?: Specification) {
    if (!this.documents[index]) {
      return;
    }

    if (type !== undefined) {
      this.documents[index].type = type;
    }

    if (namespace !== undefined) {
      this.documents[index].namespace = namespace;
    }

    if (baseUrl !== undefined) {
      this.documents[index].baseUrl = baseUrl;
    }

    if (targetFolder !== undefined) {
      this.documents[index].targetFolder = targetFolder;
    }

    if (spec !== undefined) {
      this.documents[index].spec = spec;
    }

    this.persist();
  }

  public delete(index: number) {
    if (!this.documents[index]) {
      return;
    }

    this.documents.splice(index, 1);

    this.persist();
  }

  public persist() {
    localStorage.setItem('documents', JSON.stringify(this.documents));
  }

}

export interface Document {
  name: string;
  type: string;
  namespace?: string;
  baseUrl?: string;
  targetFolder?: string|null;
  spec: Specification;
}
