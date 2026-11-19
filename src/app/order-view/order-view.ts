import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Order, orderStatuses, paymentLabel, statusBadgeClass, statusLabel } from '../models/order';

@Component({
  selector: 'app-order-view',
  imports: [DatePipe],
  templateUrl: './order-view.html',
  styleUrl: './order-view.scss',
})
export class OrderView {
  order = input.required<Order>();

  statusLabel = statusLabel;
  statusBadgeClass = statusBadgeClass;
  paymentLabel = paymentLabel;

  steps = orderStatuses.filter((status) => status.value !== 'cancelled');

  currentStepIndex = computed(() => {
    const status = this.order().status;

    for (let index = 0; index < this.steps.length; index++) {
      if (this.steps[index].value === status) {
        return index;
      }
    }

    return -1;
  });
}
