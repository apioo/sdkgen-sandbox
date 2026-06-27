import {Component, inject} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-prompt',
  imports: [
    FormsModule
  ],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.css',
})
export class PromptComponent {

  activeModal = inject(NgbActiveModal);
  name: string = '';

  submit() {
    if (this.name.trim()) {
      this.activeModal.close(this.name.trim());
    }
  }

}
