import { Pipe, PipeTransform } from '@angular/core';
import { PaymentMethod, paymentLabel } from '../models/order';

@Pipe({
  name: 'paymentLabel',
})
export class PaymentLabelPipe implements PipeTransform {
  transform(method: PaymentMethod): string {
    return paymentLabel(method);
  }
}
