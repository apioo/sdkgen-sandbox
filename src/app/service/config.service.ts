import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {

  public save(config: ConfigDto) {
    localStorage.setItem('config', JSON.stringify(config));
  }

  public load(): ConfigDto {
    const rawConfig = localStorage.getItem('config');
    if (!rawConfig) {
      return {
        clientId: '',
        clientSecret: '',
      };
    }

    return JSON.parse(rawConfig);
  }

}

export interface ConfigDto {
  clientId: string,
  clientSecret: string,
}
