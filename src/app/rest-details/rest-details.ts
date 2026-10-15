import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Restaurant } from '../models/restaurant';
import restaurantsData from '../data/restaurants.json';

@Component({
  selector: 'app-rest-details',
  imports: [RouterLink],
  templateUrl: './rest-details.html',
  styleUrl: './rest-details.scss',
})
export class RestDetails {
  id = input.required<string>();

  allRestaurants: Restaurant[] = restaurantsData as Restaurant[];

  restaurant = computed(() => {
    const id = Number(this.id());

    for (const restaurant of this.allRestaurants) {
      if (restaurant.id === id) {
        return restaurant;
      }
    }

    return undefined;
  });
}
