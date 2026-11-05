import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../product-card/product-card';
import { Product } from '../models/menu';
import { Restaurants } from '../services/restaurants';
import { Menus } from '../services/menus';
import { Cart } from '../services/cart';

@Component({
  selector: 'app-rest-details',
  imports: [RouterLink, ProductCard],
  templateUrl: './rest-details.html',
  styleUrl: './rest-details.scss',
})
export class RestDetails {
  id = input.required<string>();

  private restaurantsService = inject(Restaurants);
  private menusService = inject(Menus);
  cart = inject(Cart);

  restaurant = computed(() => {
    const id = Number(this.id());
    return this.restaurantsService.getById(id);
  });

  menu = computed(() => {
    const restaurant = this.restaurant();

    if (!restaurant) {
      return undefined;
    }

    return this.menusService.getByCuisine(restaurant.cuisine);
  });

  isCartFromThisRestaurant = computed(() => this.cart.restaurant()?.id === this.restaurant()?.id);

  pendingProduct = signal<Product | undefined>(undefined);

  addToCart(product: Product) {
    const restaurant = this.restaurant();

    if (!restaurant) {
      return;
    }

    const result = this.cart.add(restaurant, product);

    if (result === 'other-restaurant') {
      this.pendingProduct.set(product);
    }
  }

  cancelAdding() {
    this.pendingProduct.set(undefined);
  }

  replaceCart() {
    const restaurant = this.restaurant();
    const product = this.pendingProduct();

    if (restaurant && product) {
      this.cart.replaceWith(restaurant, product);
    }

    this.pendingProduct.set(undefined);
  }
}
