import { Component, inject, signal } from '@angular/core';
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
export class RestaurantForm {
  private restaurantsService = inject(Restaurants);
  private router = inject(Router);

  cuisineOptions = cuisineOptions;

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

  save(event: Event) {
    event.preventDefault();

    this.restaurantsService.create(this.restaurant());
    this.router.navigate(['/admin']);
  }
}
