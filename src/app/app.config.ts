import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withFetch} from "@angular/common/http";
import {provideHighlightOptions} from "ngx-highlightjs";

import {routes} from './app.routes';
import {NGX_MONACO_EDITOR_CONFIG} from "ngx-monaco-editor-v2";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideHighlightOptions({
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'), // Optional, add line numbers if needed
      languages: {
        json: () => import('highlight.js/lib/languages/json'),
      },
    }),
    {
      provide: NGX_MONACO_EDITOR_CONFIG,
      useFactory: () => {
        return {
        };
      }
    }
  ]
};
