import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus, statusLabel } from '../models/order';

@Pipe({
  name: 'statusLabel',
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: OrderStatus): string {
    return statusLabel(status);
  }
}
