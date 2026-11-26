import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map } from 'rxjs';
import { RestCard } from '../rest-card/rest-card';
import { cuisineOptions, Restaurant } from '../models/restaurant';
import { Restaurants } from '../services/restaurants';
import { DataState } from '../data-state/data-state';

export const SEARCH_DELAY_MS = 300;

@Component({
  selector: 'app-rest-list',
  imports: [RestCard, FormsModule, DataState],
  templateUrl: './rest-list.html',
  styleUrl: './rest-list.scss',
})
export class RestList {
  restaurantsService = inject(Restaurants);
  allRestaurants = this.restaurantsService.getAll();

  cuisineOptions = cuisineOptions;

  searchText = signal('');

  searchTerm = toSignal(
    toObservable(this.searchText).pipe(
      debounceTime(SEARCH_DELAY_MS),
      map((text) => text.trim()),
    ),
    { initialValue: '' },
  );

  searchResource = this.restaurantsService.search(() => this.searchTerm());

  isSearching = computed(() => this.searchTerm() !== '');

  searchFailed = computed(() => this.searchResource.error() !== undefined);

  waitingForSearch = computed(() => this.isSearching() && !this.searchResource.hasValue());

  private sourceRestaurants = computed(() => {
    if (!this.isSearching()) {
      return this.allRestaurants();
    }

    return this.searchResource.hasValue() ? this.searchResource.value() : [];
  });
  selectedCuisine = signal('all');
  selectedStatus = signal('all');
  sortBy = signal('rating');

  filteredRestaurants = computed(() => {
    const cuisine = this.selectedCuisine();
    const status = this.selectedStatus();
    const sortBy = this.sortBy();
    const result: Restaurant[] = [];

    for (const restaurant of this.sourceRestaurants()) {
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
