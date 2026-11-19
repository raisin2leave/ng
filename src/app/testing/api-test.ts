import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Restaurant } from '../models/restaurant';
import { Restaurants } from '../services/restaurants';
import { API_URL } from '../api';
import seed from '../../../api/db.seed.json';

export const seedRestaurants = seed.restaurants as Restaurant[];

export function restaurantFromSeed(id: number) {
  return seedRestaurants.find((restaurant) => restaurant.id === id)!;
}

export function provideTestApi() {
  return [provideHttpClient(), provideHttpClientTesting()];
}

export function fakeServer() {
  return TestBed.inject(HttpTestingController);
}

export async function settle() {
  await TestBed.inject(ApplicationRef).whenStable();
}

export async function answerRestaurantList(restaurants: Restaurant[] = seedRestaurants) {
  TestBed.inject(Restaurants);
  TestBed.tick();
  fakeServer().expectOne(`${API_URL}/restaurants`).flush(restaurants);
  await settle();
}

export async function failRestaurantList() {
  TestBed.inject(Restaurants);
  TestBed.tick();
  fakeServer()
    .expectOne(`${API_URL}/restaurants`)
    .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  await settle();
}

export async function closeRestaurantOnServer(id: number) {
  TestBed.inject(Restaurants).setActive(id, false).subscribe();
  fakeServer()
    .expectOne(`${API_URL}/restaurants/${id}`)
    .flush({ ...restaurantFromSeed(id), isActive: false });
  await settle();
}
