import { Component, computed, inject, input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Auth } from '../services/auth';
import { Orders } from '../services/orders';
import { OrderView } from '../order-view/order-view';
import { DataState } from '../data-state/data-state';

@Component({
  selector: 'app-order-details',
  imports: [RouterLink, OrderView, DataState],
  template: `
    <div class="orders-page">
      <a routerLink="/orders" class="back-link">← Wróć do moich zamówień</a>

      @if (notFound()) {
        <p class="not-found">Nie znaleziono zamówienia.</p>
      } @else if (order(); as order) {
        <app-order-view [order]="order" />
      } @else {
        <app-data-state
          [loading]="orderResource.isLoading()"
          [failed]="loadFailed()"
          loadingText="Ładowanie zamówienia…"
          (retry)="orderResource.reload()"
        />
      }
    </div>
  `,
  styles: `
    .orders-page {
      max-width: 960px;
      margin: 20px auto;
      padding: 0 30px;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 20px;
    }

    .not-found {
      margin: 40px 0;
      font-size: 1.25rem;
      color: #6c757d;
    }
  `,
})
export class OrderDetails {
  private auth = inject(Auth);
  private ordersService = inject(Orders);

  id = input.required<string>();

  orderResource = this.ordersService.loadOne(() => Number(this.id()));

  loadedOrder = computed(() => (this.orderResource.hasValue() ? this.orderResource.value() : undefined));

  isSomeoneElses = computed(() => {
    const order = this.loadedOrder();
    return order !== undefined && order.userId !== this.auth.currentUser()?.id;
  });

  order = computed(() => (this.isSomeoneElses() ? undefined : this.loadedOrder()));

  notFound = computed(() => {
    const error = this.orderResource.error();
    return (error instanceof HttpErrorResponse && error.status === 404) || this.isSomeoneElses();
  });

  loadFailed = computed(() => this.orderResource.error() !== undefined && !this.notFound());
}
