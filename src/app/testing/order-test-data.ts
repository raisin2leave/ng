import { TestBed } from '@angular/core/testing';
import { CheckoutData, Order, OrderStatus } from '../models/order';
import { Auth } from '../services/auth';
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

export function makeTestOrder(id: number, userId: string, restaurantId = 3, status: OrderStatus = 'new'): Order {
  const restaurant = restaurantFromSeed(restaurantId);
  const product = productFromSeed(restaurantId);

  return {
    ...testCheckout,
    id: id,
    userId: userId,
    createdAt: new Date(2026, 10, 20, 12, id % 60).toISOString(),
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    items: [{ productId: product.id, name: product.name, price: product.price, quantity: 2 }],
    subtotal: product.price * 2,
    deliveryFee: restaurant.deliveryFee,
    discount: 0,
    total: product.price * 2 + restaurant.deliveryFee,
    status: status,
  };
}
