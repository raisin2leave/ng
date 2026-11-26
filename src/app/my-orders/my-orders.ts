import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { statusBadgeClass, statusLabel } from '../models/order';
import { Auth } from '../services/auth';
import { newestFirst, Orders } from '../services/orders';
import { DataState } from '../data-state/data-state';

@Component({
  selector: 'app-my-orders',
  imports: [DatePipe, RouterLink, DataState],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss',
})
export class MyOrders {
  private auth = inject(Auth);
  private ordersService = inject(Orders);

  statusLabel = statusLabel;
  statusBadgeClass = statusBadgeClass;

  ordersResource = this.ordersService.loadForUser(() => this.auth.currentUser()?.id);

  myOrders = computed(() => (this.ordersResource.hasValue() ? newestFirst(this.ordersResource.value()) : []));

  loadFailed = computed(() => this.ordersResource.error() !== undefined);
}
