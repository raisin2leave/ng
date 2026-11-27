import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Order, orderStatuses } from '../models/order';
import { StatusLabelPipe } from '../pipes/status-label-pipe';
import { StatusBadgePipe } from '../pipes/status-badge-pipe';
import { PaymentLabelPipe } from '../pipes/payment-label-pipe';

@Component({
  selector: 'app-order-view',
  imports: [DatePipe, CurrencyPipe, StatusLabelPipe, StatusBadgePipe, PaymentLabelPipe],
  templateUrl: './order-view.html',
  styleUrl: './order-view.scss',
})
export class OrderView {
  order = input.required<Order>();


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
