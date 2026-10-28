import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../product-card/product-card';
import { Product } from '../models/menu';
import { Restaurants } from '../services/restaurants';
import { Menus } from '../services/menus';

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

  cart = signal<Product[]>([]);

  cartTotal = computed(() => {
    let total = 0;

    for (const product of this.cart()) {
      total = total + product.price;
    }

    return total;
  });

  addToCart(product: Product) {
    const currentCart = this.cart();
    this.cart.set([...currentCart, product]);
  }
}
