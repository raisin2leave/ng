import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderStatus, orderStatuses, statusLabel } from '../models/order';
import { Orders } from '../services/orders';
import { Users } from '../services/users';
import { OrderView } from '../order-view/order-view';
import { DataState } from '../data-state/data-state';
import { Confirm } from '../directives/confirm';

@Component({
  selector: 'app-admin-order-details',
  imports: [FormsModule, RouterLink, OrderView, DataState, Confirm],
  templateUrl: './admin-order-details.html',
  styleUrl: './admin-order-details.scss',
})
export class AdminOrderDetails {
  private ordersService = inject(Orders);
  private usersService = inject(Users);

  id = input.required<string>();

  orderStatuses = orderStatuses;

  orderResource = this.ordersService.loadOne(() => Number(this.id()));

  order = computed(() => (this.orderResource.hasValue() ? this.orderResource.value() : undefined));

  notFound = computed(() => {
    const error = this.orderResource.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  loadFailed = computed(() => this.orderResource.error() !== undefined && !this.notFound());

  customerAccount = computed(() => {
    const order = this.order();
    return order ? this.usersService.getById(order.userId) : undefined;
  });

  chosenStatus = linkedSignal<OrderStatus | ''>(() => this.order()?.status ?? '');
  message = signal('');
  saveError = signal('');
  saving = signal(false);

  saveStatus() {
    const order = this.order();
    const newStatus = this.chosenStatus();

    if (!order || newStatus === '' || newStatus === order.status) {
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.saveError.set('');

    this.ordersService.changeStatus(order.id, newStatus).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.orderResource.set(updated);
        this.message.set(`Status zamówienia nr ${order.id} zmieniono na „${statusLabel(newStatus)}”.`);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Nie udało się zmienić statusu. Sprawdź połączenie i spróbuj ponownie.');
      },
    });
  }
}
