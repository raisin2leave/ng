import { Injectable, signal } from '@angular/core';
import { Restaurant, RestaurantFormValue } from '../models/restaurant';
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

  create(data: RestaurantFormValue) {
    const newRestaurant: Restaurant = {
      ...data,
      id: this.nextId(),
      rating: 0,
    };

    this.saveAll([...this.restaurants(), newRestaurant]);
    return newRestaurant;
  }

  update(id: number, data: RestaurantFormValue) {
    const updatedList: Restaurant[] = [];

    for (const restaurant of this.restaurants()) {
      if (restaurant.id === id) {
        updatedList.push({ ...restaurant, ...data });
      } else {
        updatedList.push(restaurant);
      }
    }

    this.saveAll(updatedList);
  }

  resetToOriginal() {
    localStorage.removeItem(STORAGE_KEY);
    this.restaurants.set(restaurantsData as Restaurant[]);
  }

  private nextId() {
    let highestId = 0;

    for (const restaurant of this.restaurants()) {
      if (restaurant.id > highestId) {
        highestId = restaurant.id;
      }
    }

    return highestId + 1;
  }

  private saveAll(restaurants: Restaurant[]) {
    this.restaurants.set(restaurants);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
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
