import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { statusBadgeClass, statusLabel } from '../models/order';
import { Auth } from '../services/auth';
import { Orders } from '../services/orders';

@Component({
  selector: 'app-my-orders',
  imports: [DatePipe, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss',
})
export class MyOrders {
  private auth = inject(Auth);
  private ordersService = inject(Orders);

  statusLabel = statusLabel;
  statusBadgeClass = statusBadgeClass;

  myOrders = computed(() => {
    const user = this.auth.currentUser();

    if (!user) {
      return [];
    }

    return this.ordersService.getForUser(user.id);
  });
}
