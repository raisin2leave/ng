import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RestCard } from '../rest-card/rest-card';
import { Restaurant } from '../models/restaurant';
import restaurantsData from '../data/restaurants.json';

@Component({
  selector: 'app-rest-list',
  imports: [RestCard, FormsModule],
  templateUrl: './rest-list.html',
  styleUrl: './rest-list.scss',
})
export class RestList {
  allRestaurants: Restaurant[] = restaurantsData as Restaurant[];

  searchText = signal('');

  filteredRestaurants = computed(() => {
    const search = this.searchText().toLowerCase();
    const result: Restaurant[] = [];

    for (const restaurant of this.allRestaurants) {
      const name = restaurant.name.toLowerCase();

      if (!name.includes(search)) {
        continue;
      }

      result.push(restaurant);
    }

    return result;
  });
}
