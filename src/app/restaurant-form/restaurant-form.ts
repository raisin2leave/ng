import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField } from '@angular/forms/signals';
import { CuisineType, cuisineOptions, RestaurantFormValue } from '../models/restaurant';
import { Restaurants } from '../services/restaurants';

@Component({
  selector: 'app-restaurant-form',
  imports: [FormField, RouterLink],
  templateUrl: './restaurant-form.html',
  styleUrl: './restaurant-form.scss',
})
export class RestaurantForm implements OnInit {
  private restaurantsService = inject(Restaurants);
  private router = inject(Router);

  id = input<string>();

  cuisineOptions = cuisineOptions;
  notFound = signal(false);

  restaurant = signal<RestaurantFormValue>({
    name: '',
    description: '',
    address: '',
    cuisine: CuisineType.Polish,
    imageUrl: '',
    deliveryTimeMin: 10,
    deliveryTimeMax: 30,
    deliveryFee: 10,
    minimumOrderValue: 20,
    isActive: true,
  });

  restaurantForm = form(this.restaurant);

  ngOnInit() {
    const id = this.id();

    if (id === undefined) {
      return;
    }

    const existing = this.restaurantsService.getById(Number(id));

    if (!existing) {
      this.notFound.set(true);
      return;
    }

    this.restaurant.set({
      name: existing.name,
      description: existing.description,
      address: existing.address,
      cuisine: existing.cuisine,
      imageUrl: existing.imageUrl ?? '',
      deliveryTimeMin: existing.deliveryTimeMin,
      deliveryTimeMax: existing.deliveryTimeMax,
      deliveryFee: existing.deliveryFee,
      minimumOrderValue: existing.minimumOrderValue,
      isActive: existing.isActive,
    });
  }

  save(event: Event) {
    event.preventDefault();

    const id = this.id();

    if (id === undefined) {
      this.restaurantsService.create(this.restaurant());
    } else {
      this.restaurantsService.update(Number(id), this.restaurant());
    }

    this.router.navigate(['/admin']);
  }
}
