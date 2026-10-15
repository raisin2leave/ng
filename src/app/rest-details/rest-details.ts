import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../product-card/product-card';
import { Restaurant } from '../models/restaurant';
import { Menu, Product } from '../models/menu';
import restaurantsData from '../data/restaurants.json';
import menusData from '../data/menus.json';

@Component({
  selector: 'app-rest-details',
  imports: [RouterLink, ProductCard],
  templateUrl: './rest-details.html',
  styleUrl: './rest-details.scss',
})
export class RestDetails {
  id = input.required<string>();

  allRestaurants: Restaurant[] = restaurantsData as Restaurant[];
  allMenus: Menu[] = menusData as Menu[];

  restaurant = computed(() => {
    const id = Number(this.id());

    for (const restaurant of this.allRestaurants) {
      if (restaurant.id === id) {
        return restaurant;
      }
    }

    return undefined;
  });

  menu = computed(() => {
    const restaurant = this.restaurant();

    if (!restaurant) {
      return undefined;
    }

    for (const menu of this.allMenus) {
      if (menu.cuisine === restaurant.cuisine) {
        return menu;
      }
    }

    return undefined;
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
