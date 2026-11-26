import { TestBed } from '@angular/core/testing';
import { Orders } from './orders';
import { CheckoutData, Order } from '../models/order';
import { API_URL } from '../api';
import { fakeServer, productFromSeed, restaurantFromSeed } from '../testing/api-test';

const checkoutData: CheckoutData = {
  contact: { firstName: 'Anna', lastName: 'Nowak', email: 'anna@example.com', phone: '600100200' },
  deliveryAddress: { street: 'Prosta', buildingNumber: '1', postalCode: '00-001', city: 'Warszawa' },
  paymentMethod: 'online',
};

describe('Orders service (orders in the API)', () => {
  function cartSnapshot() {
    const restaurant = restaurantFromSeed(3);
    const product = structuredClone(productFromSeed(restaurant.id));
    return {
      restaurant,
      items: [{ product, quantity: 2 }],
      subtotal: product.price * 2,
      deliveryFee: restaurant.deliveryFee,
      total: product.price * 2 + restaurant.deliveryFee,
    };
  }

  it('should POST a new order with status "new" and let the server give it a number', () => {
    let saved: Order | undefined;
    TestBed.inject(Orders).placeOrder('user-1', cartSnapshot(), checkoutData).subscribe((order) => (saved = order));

    const request = fakeServer().expectOne(`${API_URL}/orders`);
    const body = request.request.body;
    expect(request.request.method).toBe('POST');
    expect(body.id).toBeUndefined();
    expect(body.userId).toBe('user-1');
    expect(body.status).toBe('new');
    expect(body.restaurantName).toBe('Smash Burger Co.');
    expect(body.items).toEqual([{ productId: 17, name: 'Classic Burger', price: 29.99, quantity: 2 }]);
    expect(body.contact.lastName).toBe('Nowak');

    request.flush({ ...body, id: 1 });
    expect(saved?.id).toBe(1);
  });

  it('should keep the price from the moment of ordering, even if the menu changes later', () => {
    const cart = cartSnapshot();
    TestBed.inject(Orders).placeOrder('user-1', cart, checkoutData).subscribe();
    const request = fakeServer().expectOne(`${API_URL}/orders`);

    cart.items[0].product.price = 99;

    expect(request.request.body.items[0].price).toBe(29.99);
  });

  it('should change the status with PATCH /orders/:id', () => {
    TestBed.inject(Orders).changeStatus(5, 'preparing').subscribe();

    const request = fakeServer().expectOne(`${API_URL}/orders/5`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'preparing' });
  });
});
