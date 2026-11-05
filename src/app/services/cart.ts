import { computed, Injectable, signal } from '@angular/core';
import { AddToCartResult, CartItem } from '../models/cart';
import { Product } from '../models/menu';
import { Restaurant } from '../models/restaurant';

export const MAX_QUANTITY = 99;

@Injectable({ providedIn: 'root' })
export class Cart {
  private restaurantSignal = signal<Restaurant | undefined>(undefined);
  private itemsSignal = signal<CartItem[]>([]);

  restaurant = this.restaurantSignal.asReadonly();
  items = this.itemsSignal.asReadonly();

  isEmpty = computed(() => this.items().length === 0);

  itemCount = computed(() => {
    let count = 0;

    for (const item of this.items()) {
      count = count + item.quantity;
    }

    return count;
  });

  subtotal = computed(() => {
    let sum = 0;

    for (const item of this.items()) {
      sum = sum + item.product.price * item.quantity;
    }

    return roundMoney(sum);
  });

  deliveryFee = computed(() => {
    const restaurant = this.restaurant();

    if (this.isEmpty() || !restaurant) {
      return 0;
    }

    return restaurant.deliveryFee;
  });

  total = computed(() => roundMoney(this.subtotal() + this.deliveryFee()));

  add(restaurant: Restaurant, product: Product): AddToCartResult {
    const current = this.restaurant();

    if (!this.isEmpty() && current && current.id !== restaurant.id) {
      return 'other-restaurant';
    }

    this.restaurantSignal.set(restaurant);

    const existing = this.findItem(product.id);

    if (existing) {
      this.setQuantity(product.id, existing.quantity + 1);
    } else {
      this.itemsSignal.set([...this.items(), { product: product, quantity: 1 }]);
    }

    return 'added';
  }

  replaceWith(restaurant: Restaurant, product: Product) {
    this.clear();
    this.add(restaurant, product);
  }

  setQuantity(productId: number, quantity: number) {
    if (!Number.isFinite(quantity)) {
      return;
    }

    const safeQuantity = Math.min(Math.max(Math.floor(quantity), 1), MAX_QUANTITY);
    const updatedItems: CartItem[] = [];

    for (const item of this.items()) {
      if (item.product.id === productId) {
        updatedItems.push({ ...item, quantity: safeQuantity });
      } else {
        updatedItems.push(item);
      }
    }

    this.itemsSignal.set(updatedItems);
  }

  remove(productId: number) {
    const remaining: CartItem[] = [];

    for (const item of this.items()) {
      if (item.product.id !== productId) {
        remaining.push(item);
      }
    }

    this.itemsSignal.set(remaining);

    if (remaining.length === 0) {
      this.restaurantSignal.set(undefined);
    }
  }

  clear() {
    this.itemsSignal.set([]);
    this.restaurantSignal.set(undefined);
  }

  private findItem(productId: number) {
    for (const item of this.items()) {
      if (item.product.id === productId) {
        return item;
      }
    }

    return undefined;
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
