import { Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ImageFallback } from '../directives/image-fallback';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../product-card/product-card';
import { Product } from '../models/menu';
import { Restaurants } from '../services/restaurants';
import { Menus } from '../services/menus';
import { Cart } from '../services/cart';
import { DataState } from '../data-state/data-state';
import { RatingPipe } from '../pipes/rating-pipe';
import { DeliveryTimePipe } from '../pipes/delivery-time-pipe';

@Component({
  selector: 'app-rest-details',
  imports: [RouterLink, ProductCard, DataState, CurrencyPipe, NgOptimizedImage, ImageFallback, RatingPipe, DeliveryTimePipe],
  templateUrl: './rest-details.html',
  styleUrl: './rest-details.scss',
})
export class RestDetails {
  id = input.required<string>();

  private restaurantsService = inject(Restaurants);
  private menusService = inject(Menus);
  cart = inject(Cart);

  restaurantResource = this.restaurantsService.loadOne(() => Number(this.id()));

  restaurant = computed(() => (this.restaurantResource.hasValue() ? this.restaurantResource.value() : undefined));

  notFound = computed(() => {
    const error = this.restaurantResource.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  loadFailed = computed(() => this.restaurantResource.error() !== undefined && !this.notFound());

  menuResource = this.menusService.loadForRestaurant(() => Number(this.id()));

  menuLoadFailed = computed(() => this.menuResource.error() !== undefined);

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
