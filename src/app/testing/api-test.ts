import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Restaurant } from '../models/restaurant';
import { Category, MenuInfo, Product } from '../models/menu';
import { Restaurants } from '../services/restaurants';
import { API_URL } from '../api';
import seed from '../../../api/db.seed.json';

export const seedRestaurants = seed.restaurants as Restaurant[];

export function restaurantFromSeed(id: number) {
  return seedRestaurants.find((restaurant) => restaurant.id === id)!;
}

export const seedMenus = seed.menus as MenuInfo[];
export const seedCategories = seed.categories as Category[];
export const seedProducts = seed.products as Product[];

export function categoryFromSeed(id: number) {
  return seedCategories.find((category) => category.id === id)!;
}

export function categoriesOfRestaurant(restaurantId: number) {
  const menu = seedMenus.find((m) => m.restaurantId === restaurantId);
  return seedCategories.filter((category) => category.menuId === menu?.id);
}

export function productsOfCategory(categoryId: number) {
  return seedProducts.filter((product) => product.categoryId === categoryId);
}

export function productsOfRestaurant(restaurantId: number) {
  return categoriesOfRestaurant(restaurantId).flatMap((category) => productsOfCategory(category.id));
}

export function productFromSeed(restaurantId: number) {
  return productsOfRestaurant(restaurantId)[0];
}

export function provideTestApi() {
  return [provideHttpClient(), provideHttpClientTesting()];
}

export function fakeServer() {
  return TestBed.inject(HttpTestingController);
}

export async function settle() {
  for (let round = 0; round < 3; round++) {
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
  }

  TestBed.tick();
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

export async function answerMenu(restaurantId: number) {
  TestBed.tick();
  const menus = seedMenus.filter((menu) => menu.restaurantId === restaurantId);
  fakeServer().expectOne(`${API_URL}/restaurants/${restaurantId}/menus`).flush(menus);

  if (menus.length > 0) {
    const categories = categoriesOfRestaurant(restaurantId);
    fakeServer().expectOne(`${API_URL}/menus/${menus[0].id}/categories`).flush(categories);

    for (const category of categories) {
      fakeServer().expectOne(`${API_URL}/categories/${category.id}/products`).flush(productsOfCategory(category.id));
    }
  }

  await settle();
}
