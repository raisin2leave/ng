import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderStatus, orderStatuses, statusLabel } from '../models/order';
import { Orders } from '../services/orders';
import { Users } from '../services/users';
import { OrderView } from '../order-view/order-view';

@Component({
  selector: 'app-admin-order-details',
  imports: [FormsModule, RouterLink, OrderView],
  templateUrl: './admin-order-details.html',
  styleUrl: './admin-order-details.scss',
})
export class AdminOrderDetails {
  private ordersService = inject(Orders);
  private usersService = inject(Users);

  id = input.required<string>();

  orderStatuses = orderStatuses;

  order = computed(() => this.ordersService.getById(Number(this.id())));

  customerAccount = computed(() => {
    const order = this.order();
    return order ? this.usersService.getById(order.userId) : undefined;
  });

  chosenStatus = linkedSignal<OrderStatus | ''>(() => this.order()?.status ?? '');
  message = signal('');

  saveStatus(event: Event) {
    event.preventDefault();

    const order = this.order();
    const newStatus = this.chosenStatus();

    if (!order || newStatus === '' || newStatus === order.status) {
      return;
    }

    if (newStatus === 'cancelled' && !confirm(`Czy na pewno anulować zamówienie nr ${order.id}?`)) {
      return;
    }

    this.ordersService.changeStatus(order.id, newStatus);
    this.message.set(`Status zamówienia nr ${order.id} zmieniono na „${statusLabel(newStatus)}”.`);
  }
}
