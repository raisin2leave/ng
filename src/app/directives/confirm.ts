import { Directive, input, output } from '@angular/core';

@Directive({
  selector: 'button[appConfirm]',
  host: {
    '(click)': 'askFirst()',
  },
})
export class Confirm {
  appConfirm = input('');
  confirmed = output<void>();

  askFirst() {
    const question = this.appConfirm();

    if (question === '' || confirm(question)) {
      this.confirmed.emit();
    }
  }
}
