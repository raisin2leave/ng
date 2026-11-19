import { Injectable, signal } from '@angular/core';
import { CheckoutData, Order, OrderItem } from '../models/order';
import { CartItem } from '../models/cart';
import { Restaurant } from '../models/restaurant';

const STORAGE_KEY = 'foodapp-orders';
const FIRST_ORDER_NUMBER = 1001;

export type CartSnapshot = {
  restaurant: Restaurant;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

@Injectable({ providedIn: 'root' })
export class Orders {
  private orders = signal<Order[]>(this.loadFromStorage());

  getAll() {
    return this.orders.asReadonly();
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

    const order: Order = {
      ...checkout,
      id: this.nextOrderNumber(),
      userId: userId,
      createdAt: new Date().toISOString(),
      restaurantId: cart.restaurant.id,
      restaurantName: cart.restaurant.name,
      items: items,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
      status: 'new',
    };

    this.saveAll([...this.orders(), order]);
    return order;
  }

  private nextOrderNumber() {
    let highest = FIRST_ORDER_NUMBER - 1;

    for (const order of this.orders()) {
      if (order.id > highest) {
        highest = order.id;
      }
    }

    return highest + 1;
  }

  private saveAll(orders: Order[]) {
    this.orders.set(orders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }

  private loadFromStorage(): Order[] {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    return [];
  }
}
