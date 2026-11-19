import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order, orderStatuses, statusBadgeClass, statusLabel } from '../models/order';
import { newestFirst, Orders } from '../services/orders';

@Component({
  selector: 'app-admin-orders',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
})
export class AdminOrders {
  private ordersService = inject(Orders);

  allOrders = this.ordersService.getAll();
  orderStatuses = orderStatuses;
  statusLabel = statusLabel;
  statusBadgeClass = statusBadgeClass;

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
