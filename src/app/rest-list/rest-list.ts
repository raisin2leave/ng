import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RestCard } from '../rest-card/rest-card';
import { CuisineType, Restaurant } from '../models/restaurant';
import { Restaurants } from '../services/restaurants';

@Component({
  selector: 'app-rest-list',
  imports: [RestCard, FormsModule],
  templateUrl: './rest-list.html',
  styleUrl: './rest-list.scss',
})
export class RestList {
  private restaurantsService = inject(Restaurants);
  allRestaurants = this.restaurantsService.getAll();

  cuisineOptions = [
    { value: CuisineType.American, label: 'Amerykańska' },
    { value: CuisineType.Italian, label: 'Włoska' },
    { value: CuisineType.Chinese, label: 'Chińska' },
    { value: CuisineType.Thai, label: 'Tajska' },
    { value: CuisineType.Polish, label: 'Polska' },
  ];

  searchText = signal('');
  selectedCuisine = signal('all');
  selectedStatus = signal('all');
  sortBy = signal('rating');

  filteredRestaurants = computed(() => {
    const search = this.searchText().toLowerCase();
    const cuisine = this.selectedCuisine();
    const status = this.selectedStatus();
    const sortBy = this.sortBy();
    const result: Restaurant[] = [];

    for (const restaurant of this.allRestaurants()) {
      const name = restaurant.name.toLowerCase();

      if (!name.includes(search)) {
        continue;
      }

      if (cuisine !== 'all' && restaurant.cuisine !== cuisine) {
        continue;
      }

      if (status === 'open' && !restaurant.isActive) {
        continue;
      }

      result.push(restaurant);
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'deliveryTime') {
      result.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin);
    } else if (sortBy === 'deliveryFee') {
      result.sort((a, b) => a.deliveryFee - b.deliveryFee);
    }

    return result;
  });

  resetFilters() {
    this.searchText.set('');
    this.selectedCuisine.set('all');
    this.selectedStatus.set('all');
    this.sortBy.set('rating');
  }
}
