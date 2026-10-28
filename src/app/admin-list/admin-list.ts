import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { cuisineOptions } from '../models/restaurant';
import { Restaurants } from '../services/restaurants';

@Component({
  selector: 'app-admin-list',
  imports: [RouterLink],
  templateUrl: './admin-list.html',
  styleUrl: './admin-list.scss',
})
export class AdminList {
  private restaurantsService = inject(Restaurants);
  restaurants = this.restaurantsService.getAll();

  cuisineLabel(cuisine: string) {
    for (const option of cuisineOptions) {
      if (option.value === cuisine) {
        return option.label;
      }
    }

    return cuisine;
  }

  deactivate(id: number) {
    this.restaurantsService.setActive(id, false);
  }

  activate(id: number) {
    this.restaurantsService.setActive(id, true);
  }

  resetData() {
    if (confirm('Usunąć wszystkie zmiany i przywrócić oryginalne dane?')) {
      this.restaurantsService.resetToOriginal();
    }
  }
}
