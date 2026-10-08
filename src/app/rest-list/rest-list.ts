import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RestCard } from '../rest-card/rest-card';
import { CuisineType, Restaurant } from '../models/restaurant';
import restaurantsData from '../data/restaurants.json';

@Component({
  selector: 'app-rest-list',
  imports: [RestCard, FormsModule],
  templateUrl: './rest-list.html',
  styleUrl: './rest-list.scss',
})
export class RestList {
  allRestaurants: Restaurant[] = restaurantsData as Restaurant[];

  cuisineOptions = [
    { value: CuisineType.American, label: 'Amerykańska' },
    { value: CuisineType.Italian, label: 'Włoska' },
    { value: CuisineType.Chinese, label: 'Chińska' },
    { value: CuisineType.Thai, label: 'Tajska' },
    { value: CuisineType.Polish, label: 'Polska' },
  ];

  searchText = signal('');
  selectedCuisine = signal('all');

  filteredRestaurants = computed(() => {
    const search = this.searchText().toLowerCase();
    const cuisine = this.selectedCuisine();
    const result: Restaurant[] = [];

    for (const restaurant of this.allRestaurants) {
      const name = restaurant.name.toLowerCase();

      if (!name.includes(search)) {
        continue;
      }

      if (cuisine !== 'all' && restaurant.cuisine !== cuisine) {
        continue;
      }

      result.push(restaurant);
    }

    return result;
  });
}
