import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cart, MAX_QUANTITY } from '../services/cart';
import { Restaurants } from '../services/restaurants';
import { CartItem } from '../models/cart';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  cart = inject(Cart);
  private restaurantsService = inject(Restaurants);

  maxQuantity = MAX_QUANTITY;

  restaurantIsOpen = computed(() => {
    const restaurant = this.cart.restaurant();

    if (!restaurant) {
      return false;
    }

    return this.restaurantsService.getById(restaurant.id)?.isActive === true;
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
