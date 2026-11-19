import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { cartReadyGuard } from './cart-guard';
import { Cart } from '../services/cart';
import { Restaurants } from '../services/restaurants';
import { Menus } from '../services/menus';
import { routes } from '../app.routes';
import { loggedInGuard } from './auth-guards';

describe('cartReadyGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function ask() {
    const result = TestBed.runInInjectionContext(() => cartReadyGuard({} as never, {} as never));

    if (result instanceof UrlTree) {
      return 'redirect to ' + TestBed.inject(Router).serializeUrl(result);
    }

    return result;
  }

  function fillCart() {
    const restaurant = TestBed.inject(Restaurants).getById(3)!;
    const product = TestBed.inject(Menus).getByCuisine(restaurant.cuisine)!.categories[0].products[0];
    TestBed.inject(Cart).add(restaurant, product);
    return restaurant;
  }

  it('should not let an empty cart start checkout', () => {
    expect(ask()).toBe('redirect to /cart');
  });

  it('should let a filled cart from an open restaurant into checkout', () => {
    fillCart();
    expect(ask()).toBe(true);
  });

  it('should not allow checkout when the restaurant was closed in the meantime', () => {
    const restaurant = fillCart();
    TestBed.inject(Restaurants).setActive(restaurant.id, false);
    expect(ask()).toBe('redirect to /cart');
  });

  it('should protect /checkout with both the login guard and the cart guard', () => {
    const checkoutRoute = routes.find((route) => route.path === 'checkout')!;
    expect(checkoutRoute.canActivate).toEqual([loggedInGuard, cartReadyGuard]);
  });
});
