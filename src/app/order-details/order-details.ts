import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../services/auth';
import { Orders } from '../services/orders';
import { OrderView } from '../order-view/order-view';

@Component({
  selector: 'app-order-details',
  imports: [RouterLink, OrderView],
  template: `
    <div class="orders-page">
      <a routerLink="/orders" class="back-link">← Wróć do moich zamówień</a>

      @if (order(); as order) {
        <app-order-view [order]="order" />
      } @else {
        <p class="not-found">Nie znaleziono zamówienia.</p>
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

  order = computed(() => {
    const order = this.ordersService.getById(Number(this.id()));
    const user = this.auth.currentUser();

    if (!order || !user || order.userId !== user.id) {
      return undefined;
    }

    return order;
  });
}
