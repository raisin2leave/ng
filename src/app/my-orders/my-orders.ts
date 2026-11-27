import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../services/auth';
import { newestFirst, Orders } from '../services/orders';
import { DataState } from '../data-state/data-state';
import { StatusLabelPipe } from '../pipes/status-label-pipe';
import { StatusBadgePipe } from '../pipes/status-badge-pipe';

@Component({
  selector: 'app-my-orders',
  imports: [DatePipe, RouterLink, DataState, CurrencyPipe, StatusLabelPipe, StatusBadgePipe],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss',
})
export class MyOrders {
  private auth = inject(Auth);
  private ordersService = inject(Orders);


  ordersResource = this.ordersService.loadForUser(() => this.auth.currentUser()?.id);

  myOrders = computed(() => (this.ordersResource.hasValue() ? newestFirst(this.ordersResource.value()) : []));

  loadFailed = computed(() => this.ordersResource.error() !== undefined);
}
