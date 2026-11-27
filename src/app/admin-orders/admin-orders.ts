import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order, orderStatuses } from '../models/order';
import { newestFirst, Orders } from '../services/orders';
import { DataState } from '../data-state/data-state';
import { StatusLabelPipe } from '../pipes/status-label-pipe';
import { StatusBadgePipe } from '../pipes/status-badge-pipe';

@Component({
  selector: 'app-admin-orders',
  imports: [DatePipe, FormsModule, RouterLink, DataState, CurrencyPipe, StatusLabelPipe, StatusBadgePipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
})
export class AdminOrders {
  private ordersService = inject(Orders);

  ordersResource = this.ordersService.loadAll();

  allOrders = computed(() => (this.ordersResource.hasValue() ? this.ordersResource.value() : []));

  loadFailed = computed(() => this.ordersResource.error() !== undefined);
  orderStatuses = orderStatuses;

  statusFilter = signal('all');

  visibleOrders = computed(() => {
    const status = this.statusFilter();
    const result: Order[] = [];

    for (const order of this.allOrders()) {
      if (status === 'all' || order.status === status) {
        result.push(order);
      }
    }

    return newestFirst(result);
  });

  countWithStatus(status: string) {
    let count = 0;

    for (const order of this.allOrders()) {
      if (order.status === status) {
        count = count + 1;
      }
    }

    return count;
  }
}
