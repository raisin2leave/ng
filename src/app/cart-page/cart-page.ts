import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cart, MAX_QUANTITY } from '../services/cart';
import { Restaurants } from '../services/restaurants';
import { CartItem } from '../models/cart';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  cart = inject(Cart);
  private restaurantsService = inject(Restaurants);

  maxQuantity = MAX_QUANTITY;

  codeText = signal('');
  codeError = signal('');

  applyCode(event: Event) {
    event.preventDefault();

    if (this.codeText().trim() === '') {
      this.codeError.set('Wpisz kod rabatowy.');
      return;
    }

    if (!this.cart.applyDiscountCode(this.codeText())) {
      this.codeError.set('Nieprawidłowy kod rabatowy.');
      return;
    }

    this.codeText.set('');
    this.codeError.set('');
  }

  removeCode() {
    this.cart.removeDiscountCode();
  }

  restaurantIsOpen = computed(() => {
    const restaurant = this.cart.restaurant();

    if (!restaurant) {
      return false;
    }

    return this.restaurantsService.isOpenNow(restaurant);
  });

  increase(item: CartItem) {
    this.cart.changeQuantityBy(item.product.id, 1);
  }

  decrease(item: CartItem) {
    this.cart.changeQuantityBy(item.product.id, -1);
  }

  onQuantityChange(item: CartItem, event: Event) {
    const field = event.target as HTMLInputElement;
    this.cart.setQuantity(item.product.id, field.valueAsNumber);

    for (const current of this.cart.items()) {
      if (current.product.id === item.product.id) {
        field.value = String(current.quantity);
      }
    }
  }

  remove(item: CartItem) {
    this.cart.remove(item.product.id);
  }
}
