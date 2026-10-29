import { Component, computed, input } from '@angular/core';

type FieldStatus = {
  touched(): boolean;
  invalid(): boolean;
  errors(): { kind: string; message?: string }[];
};

@Component({
  selector: 'app-field-errors',
  imports: [],
  template: `
    @if (visible()) {
      @for (error of field().errors(); track error.kind) {
        <div class="invalid-feedback d-block">{{ error.message }}</div>
      }
    }
  `,
})
export class FieldErrors {
  field = input.required<FieldStatus>();
  showAll = input(false);

  visible = computed(() => (this.field().touched() || this.showAll()) && this.field().invalid());
}
