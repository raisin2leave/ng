import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Menus } from './menus';
import { API_URL } from '../api';
import { answerMenu, fakeServer, settle } from '../testing/api-test';

@Component({ template: '' })
class MenuHost {
  resource = inject(Menus).loadForRestaurant(() => 3);
}

describe('Menus service (menu from the API)', () => {
  it('should build the menu from three requests: menus → categories → products', async () => {
    const host = TestBed.createComponent(MenuHost).componentInstance;
    await answerMenu(3);

    const menu = host.resource.value()!;
    expect(menu.id).toBe(3);
    expect(menu.categories.map((c) => c.name)).toEqual(['Burgery', 'Frytki', 'Napoje']);
    expect(menu.categories[0].products.map((p) => p.name)).toEqual([
      'Classic Burger',
      'Cheeseburger',
      'Bacon Burger',
      'Double Smash Burger',
    ]);
  });

  it('should give null when the restaurant has no menu', async () => {
    const host = TestBed.createComponent(MenuHost).componentInstance;
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/restaurants/3/menus`).flush([]);
    await settle();

    expect(host.resource.value()).toBeNull();
  });

  it('should give an empty list of categories when the menu has none', async () => {
    const host = TestBed.createComponent(MenuHost).componentInstance;
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/restaurants/3/menus`).flush([{ id: 3, restaurantId: 3, name: 'Menu' }]);
    fakeServer().expectOne(`${API_URL}/menus/3/categories`).flush([]);
    await settle();

    expect(host.resource.value()?.categories).toEqual([]);
  });

  it('should report an error when one of the requests fails', async () => {
    const host = TestBed.createComponent(MenuHost).componentInstance;
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/restaurants/3/menus`).flush([{ id: 3, restaurantId: 3, name: 'Menu' }]);
    fakeServer().expectOne(`${API_URL}/menus/3/categories`).flush('down', { status: 500, statusText: 'Server Error' });
    await settle();

    expect(host.resource.error()).toBeDefined();
    expect(host.resource.hasValue()).toBe(false);
  });

  it('should send the admin changes to the right addresses', () => {
    const service = TestBed.inject(Menus);
    const product = { name: 'Sałatka Cezar', description: 'Sałata, kurczak, grzanki.', price: 24.5, imageUrl: '', isAvailable: true };

    service.addProduct(9, product).subscribe();
    const post = fakeServer().expectOne(`${API_URL}/products`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ ...product, categoryId: 9 });

    service.updateProduct(17, product).subscribe();
    expect(fakeServer().expectOne(`${API_URL}/products/17`).request.method).toBe('PATCH');

    service.deleteCategory(8).subscribe();
    expect(fakeServer().expectOne(`${API_URL}/categories/8`).request.method).toBe('DELETE');
  });
});
