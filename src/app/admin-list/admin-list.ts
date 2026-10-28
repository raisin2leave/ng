import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { cuisineOptions, Restaurant } from '../models/restaurant';
import { Restaurants } from '../services/restaurants';

@Component({
  selector: 'app-admin-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-list.html',
  styleUrl: './admin-list.scss',
})
export class AdminList {
  private restaurantsService = inject(Restaurants);
  restaurants = this.restaurantsService.getAll();

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
        (a, b) => this.cuisineLabel(a.cuisine).localeCompare(this.cuisineLabel(b.cuisine), 'pl') * direction,
      );
    } else if (column === 'rating') {
      result.sort((a, b) => (a.rating - b.rating) * direction);
    } else if (column === 'active') {
      result.sort((a, b) => (Number(a.isActive) - Number(b.isActive)) * direction);
    }

    return result;
  });

  cuisineLabel(cuisine: string) {
    for (const option of cuisineOptions) {
      if (option.value === cuisine) {
        return option.label;
      }
    }

    return cuisine;
  }

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
    if (confirm(`Czy na pewno chcesz dezaktywować restaurację „${restaurant.name}”?`)) {
      this.restaurantsService.setActive(restaurant.id, false);
    }
  }

  activate(restaurant: Restaurant) {
    this.restaurantsService.setActive(restaurant.id, true);
  }

  resetData() {
    if (confirm('Usunąć wszystkie zmiany i przywrócić oryginalne dane?')) {
      this.restaurantsService.resetToOriginal();
    }
  }
}
