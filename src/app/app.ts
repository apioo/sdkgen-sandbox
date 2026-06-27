import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}

export interface FusioAPI {
  selectDirectory: () => Promise<string | null>;
  writeModels: (outputDir: string, files: Array<{ file: string, content: string }>) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    fusio: FusioAPI;
  }
}
