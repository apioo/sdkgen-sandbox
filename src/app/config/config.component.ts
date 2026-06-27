import {Component, inject, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {ConfigDto, ConfigService} from "../service/config.service";
import {Document} from "../service/document.service";

@Component({
  selector: 'app-config',
  imports: [
    FormsModule
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css',
})
export class ConfigComponent implements OnInit {

  config: ConfigDto = {
    clientId: '',
    clientSecret: '',
  };

  @Input()
  document!: Document;

  activeModal = inject(NgbActiveModal);
  private configService = inject(ConfigService);

  ngOnInit() {
    this.config = this.configService.load();
  }

  get isElectron(): boolean {
    return !!(window && window.electronAPI);
  }

  doSave() {
    this.configService.save(this.config);
    this.activeModal.close();
  }

  async chooseFolder() {
    if (!this.isElectron) {
      alert('Folder picking is only available in the Electron-App');
      return;
    }

    this.document.targetFolder = await window.electronAPI.selectDirectory();
  }

}
