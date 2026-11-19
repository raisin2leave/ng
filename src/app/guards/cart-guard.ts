import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Cart } from '../services/cart';
import { Restaurants } from '../services/restaurants';

export const cartReadyGuard: CanActivateFn = () => {
  const cart = inject(Cart);
  const restaurants = inject(Restaurants);
  const router = inject(Router);

  const restaurant = cart.restaurant();

  if (cart.isEmpty() || !restaurant) {
    return router.createUrlTree(['/cart']);
  }

  if (!restaurants.isOpenNow(restaurant)) {
    return router.createUrlTree(['/cart']);
  }

  return true;
};
