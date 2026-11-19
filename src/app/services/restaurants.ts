import { computed, inject, Injectable } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { tap } from 'rxjs';
import { Restaurant, RestaurantFormValue } from '../models/restaurant';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class Restaurants {
  private http = inject(HttpClient);

  private listResource = httpResource<Restaurant[]>(() => `${API_URL}/restaurants`, {
    defaultValue: [],
  });

  private restaurants = computed(() => (this.listResource.hasValue() ? this.listResource.value() : []));

  isLoading = this.listResource.isLoading;
  loadFailed = computed(() => this.listResource.error() !== undefined);
  hasLoaded = computed(() => this.listResource.status() === 'resolved' || this.listResource.status() === 'local');

  getAll() {
    return this.restaurants;
  }

  getById(id: number) {
    for (const restaurant of this.restaurants()) {
      if (restaurant.id === id) {
        return restaurant;
      }
    }

    return undefined;
  }

  isOpenNow(restaurant: Restaurant) {
    const current = this.getById(restaurant.id) ?? restaurant;
    return current.isActive;
  }

  reload() {
    this.listResource.reload();
  }

  create(data: RestaurantFormValue) {
    return this.http
      .post<Restaurant>(`${API_URL}/restaurants`, { ...data, rating: 0 })
      .pipe(tap((created) => this.listResource.update((list) => [...list, created])));
  }

  update(id: number, data: RestaurantFormValue) {
    return this.http
      .patch<Restaurant>(`${API_URL}/restaurants/${id}`, data)
      .pipe(tap((updated) => this.replaceInList(updated)));
  }

  setActive(id: number, isActive: boolean) {
    return this.http
      .patch<Restaurant>(`${API_URL}/restaurants/${id}`, { isActive: isActive })
      .pipe(tap((updated) => this.replaceInList(updated)));
  }

  private replaceInList(updated: Restaurant) {
    this.listResource.update((list) => {
      const result: Restaurant[] = [];

      for (const restaurant of list) {
        result.push(restaurant.id === updated.id ? updated : restaurant);
      }

      return result;
    });
  }
}
