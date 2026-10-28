import { Injectable, signal } from '@angular/core';
import { Restaurant } from '../models/restaurant';
import restaurantsData from '../data/restaurants.json';

const STORAGE_KEY = 'foodapp-restaurants';

@Injectable({ providedIn: 'root' })
export class Restaurants {
  private restaurants = signal<Restaurant[]>(this.loadFromStorage());

  getAll() {
    return this.restaurants.asReadonly();
  }

  getById(id: number) {
    for (const restaurant of this.restaurants()) {
      if (restaurant.id === id) {
        return restaurant;
      }
    }

    return undefined;
  }

  private loadFromStorage(): Restaurant[] {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    return restaurantsData as Restaurant[];
  }
}
