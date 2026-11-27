import { afterNextRender, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
})
export class Autofocus {
  private element: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    afterNextRender(() => this.element.focus());
  }
}
