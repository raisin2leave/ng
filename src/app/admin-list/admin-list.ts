import { Component, computed, inject, signal } from '@angular/core';
import { DataState } from '../data-state/data-state';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { cuisineLabel, Restaurant } from '../models/restaurant';
import { Restaurants } from '../services/restaurants';
import { CuisineLabelPipe } from '../pipes/cuisine-label-pipe';
import { RatingPipe } from '../pipes/rating-pipe';
import { Confirm } from '../directives/confirm';

@Component({
  selector: 'app-admin-list',
  imports: [RouterLink, FormsModule, DataState, CuisineLabelPipe, RatingPipe, Confirm],
  templateUrl: './admin-list.html',
  styleUrl: './admin-list.scss',
})
export class AdminList {
  restaurantsService = inject(Restaurants);
  restaurants = this.restaurantsService.getAll();
  saveError = signal('');

  searchText = signal('');
  statusFilter = signal('all');
  sortColumn = signal('');
  sortAscending = signal(true);

  visibleRestaurants = computed(() => {
    const search = this.searchText().toLowerCase();
    const status = this.statusFilter();
    const result: Restaurant[] = [];

    for (const restaurant of this.restaurants()) {
      if (!restaurant.name.toLowerCase().includes(search)) {
        continue;
      }

      if (status === 'active' && !restaurant.isActive) {
        continue;
      }

      if (status === 'inactive' && restaurant.isActive) {
        continue;
      }

      result.push(restaurant);
    }

    const column = this.sortColumn();
    const direction = this.sortAscending() ? 1 : -1;

    if (column === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'pl') * direction);
    } else if (column === 'cuisine') {
      result.sort(
        (a, b) => cuisineLabel(a.cuisine).localeCompare(cuisineLabel(b.cuisine), 'pl') * direction,
      );
    } else if (column === 'rating') {
      result.sort((a, b) => (a.rating - b.rating) * direction);
    } else if (column === 'active') {
      result.sort((a, b) => (Number(a.isActive) - Number(b.isActive)) * direction);
    }

    return result;
  });

  sortBy(column: string) {
    if (this.sortColumn() === column) {
      this.sortAscending.set(!this.sortAscending());
    } else {
      this.sortColumn.set(column);
      this.sortAscending.set(true);
    }
  }

  sortIcon(column: string) {
    if (this.sortColumn() !== column) {
      return '↕';
    }

    return this.sortAscending() ? '▲' : '▼';
  }

  ariaSort(column: string) {
    if (this.sortColumn() !== column) {
      return 'none';
    }

    return this.sortAscending() ? 'ascending' : 'descending';
  }

  clearFilters() {
    this.searchText.set('');
    this.statusFilter.set('all');
    this.sortColumn.set('');
    this.sortAscending.set(true);
  }

  deactivate(restaurant: Restaurant) {
    this.changeActive(restaurant, false);
  }

  activate(restaurant: Restaurant) {
    this.changeActive(restaurant, true);
  }

  private changeActive(restaurant: Restaurant, isActive: boolean) {
    this.saveError.set('');

    this.restaurantsService.setActive(restaurant.id, isActive).subscribe({
      error: () => this.saveError.set(`Nie udało się zapisać zmiany dla „${restaurant.name}”. Spróbuj ponownie.`),
    });
  }
}
