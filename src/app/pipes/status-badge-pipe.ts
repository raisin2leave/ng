import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus, statusBadgeClass } from '../models/order';

@Pipe({
  name: 'statusBadge',
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: OrderStatus): string {
    return statusBadgeClass(status);
  }
}
