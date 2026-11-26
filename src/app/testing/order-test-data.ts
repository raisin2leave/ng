import { TestBed } from '@angular/core/testing';
import { CheckoutData } from '../models/order';
import { Auth } from '../services/auth';
import { Orders } from '../services/orders';
import { Users } from '../services/users';
import { restaurantFromSeed, productFromSeed } from './api-test';

export const testCheckout: CheckoutData = {
  contact: { firstName: 'Anna', lastName: 'Nowak', email: 'anna@example.com', phone: '600100200' },
  deliveryAddress: { street: 'Prosta', buildingNumber: '12', apartmentNumber: '4', postalCode: '00-950', city: 'Warszawa' },
  paymentMethod: 'online',
};

export function createCustomer(name: string, email: string) {
  return TestBed.inject(Users).registerCustomer({
    name: name,
    email: email,
    password: 'bezpieczne1',
    phone: '600100200',
    deliveryAddress: { street: 'Prosta', buildingNumber: '1', postalCode: '00-001', city: 'Warszawa' },
  })!;
}

export function logIn(email: string) {
  TestBed.inject(Auth).login(email, 'bezpieczne1');
}

export function placeTestOrder(userId: string, restaurantId = 3) {
  const restaurant = restaurantFromSeed(restaurantId);
  const product = productFromSeed(restaurant.id);

  return TestBed.inject(Orders).placeOrder(
    userId,
    {
      restaurant: restaurant,
      items: [{ product: product, quantity: 2 }],
      subtotal: product.price * 2,
      deliveryFee: restaurant.deliveryFee,
      total: product.price * 2 + restaurant.deliveryFee,
    },
    testCheckout,
  );
}
