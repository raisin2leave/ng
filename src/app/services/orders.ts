import { inject, Injectable } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { CheckoutData, NewOrder, Order, OrderItem, OrderStatus } from '../models/order';
import { CartItem } from '../models/cart';
import { Restaurant } from '../models/restaurant';
import { API_URL } from '../api';

export type CartSnapshot = {
  restaurant: Restaurant;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountCode?: string;
  discount?: number;
  total: number;
};

@Injectable({ providedIn: 'root' })
export class Orders {
  private http = inject(HttpClient);

  loadAll() {
    return httpResource<Order[]>(() => `${API_URL}/orders`);
  }

  loadForUser(userId: () => string | undefined) {
    return httpResource<Order[]>(() => {
      const id = userId();

      if (id === undefined) {
        return undefined;
      }

      return { url: `${API_URL}/orders`, params: { userId: id } };
    });
  }

  loadOne(id: () => number) {
    return httpResource<Order>(() => `${API_URL}/orders/${id()}`);
  }

  placeOrder(userId: string, cart: CartSnapshot, checkout: CheckoutData) {
    const items: OrderItem[] = [];

    for (const item of cart.items) {
      items.push({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      });
    }

    const order: NewOrder = {
      ...checkout,
      userId: userId,
      createdAt: new Date().toISOString(),
      restaurantId: cart.restaurant.id,
      restaurantName: cart.restaurant.name,
      items: items,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      discountCode: cart.discountCode,
      discount: cart.discount ?? 0,
      total: cart.total,
      status: 'new',
    };

    return this.http.post<Order>(`${API_URL}/orders`, order);
  }

  changeStatus(id: number, status: OrderStatus) {
    return this.http.patch<Order>(`${API_URL}/orders/${id}`, { status: status });
  }
}

export function newestFirst(orders: Order[]) {
  return [...orders].sort((a, b) => b.id - a.id);
}
