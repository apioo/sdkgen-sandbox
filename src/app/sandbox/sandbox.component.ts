import {Component, inject, OnInit, signal} from '@angular/core';
import {ExportService, Specification, TypeschemaEditorModule} from "ngx-typeschema-editor";
import {Document, DocumentService} from "../service/document.service";
import {NgClass} from "@angular/common";
import {EditorComponent} from "ngx-monaco-editor-v2";
import {FormsModule} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ConfigComponent} from "../config/config.component";
import {ClientService, Message, Type} from "../service/client.service";

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  imports: [
    TypeschemaEditorModule,
    NgClass,
    EditorComponent,
    FormsModule
  ],
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit {

  spec = signal<Specification>({
    imports: [],
    operations: [],
    types: [],
  });

  preview = signal<string>('');
  selected = signal<number>(-1);
  documents = signal<Array<Document>>([]);

  type = signal<string>('model-typescript');
  types = signal<Array<Type>>([]);
  response = signal<Message|undefined>(undefined);

  private clientService = inject(ClientService);
  private documentService = inject(DocumentService);
  private exportService = inject(ExportService);
  private modalService = inject(NgbModal);

  ngOnInit(): void {
    this.documentService.loadFromStorage();
    this.load();
    this.loadTypes();
    this.selectDefault();
  }

  load() {
    this.documents.set(this.documentService.getAll());
  }

  async loadTypes() {
    this.types.set(await this.clientService.getTypes());
  }

  getDocument(): Document|undefined {
    const document = this.documentService.get(this.selected());
    if (!document) {
      return;
    }

    return document;
  }

  doSelect(index: number) {
    const document = this.documentService.get(index);
    if (!document) {
      return;
    }

    this.response.set(undefined);
    this.selected.set(index);
    this.type.set(document.type || 'model-typescript');
    this.spec.set(document.spec);
    this.preview.set(JSON.stringify(this.exportService.transform(document.spec), null, 2));
  }

  doDelete(index: number) {
    const result = confirm(`Do you want to delete this document?`);
    if (result) {
      this.documentService.delete(index);
      this.load();
      this.selectDefault();
    }
  }

  private selectDefault() {
    if (this.selected() === -1 && this.documents().length > 0) {
      this.doSelect(0);
    }
  }

  new() {
    const name = prompt('Document name');
    if (!name) {
      return;
    }

    const index = this.documentService.create(name, 'model-typescript');

    this.load();
    this.doSelect(index);
  }

  onChange(spec: Specification) {
    this.documentService.update(this.selected(), this.type(), undefined, undefined, undefined, spec);

    this.preview.set(JSON.stringify(this.exportService.transform(spec), null, 2));
  }

  async doGenerate() {
    const document = this.getDocument();

    const selected = this.selected();
    const type = this.type();
    const spec = this.spec();
    if (!type || !spec || !document) {
      return;
    }

    const json = this.exportService.transform(spec);

    this.documentService.update(selected, type);

    this.response.set(await this.clientService.generate(document, json));
  }

  showConfig() {
    const document = this.getDocument();

    const instance = this.modalService.open(ConfigComponent);
    instance.componentInstance.document = document;
  }

  showMessage(message: string) {

    console.log(message);

    alert(message);
  }

}
