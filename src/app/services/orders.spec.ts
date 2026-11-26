import { TestBed } from '@angular/core/testing';
import { Orders } from './orders';
import { CheckoutData } from '../models/order';
import { productFromSeed, restaurantFromSeed } from '../testing/api-test';

const checkoutData: CheckoutData = {
  contact: { firstName: 'Anna', lastName: 'Nowak', email: 'anna@example.com', phone: '600100200' },
  deliveryAddress: { street: 'Prosta', buildingNumber: '1', postalCode: '00-001', city: 'Warszawa' },
  paymentMethod: 'online',
};

describe('Orders service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

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

  it('should start with no orders', () => {
    expect(TestBed.inject(Orders).getAll()().length).toBe(0);
  });

  it('should place an order with status "new", numbered from 1001, and save it', () => {
    const service = TestBed.inject(Orders);

    const first = service.placeOrder('user-1', cartSnapshot(), checkoutData);
    const second = service.placeOrder('user-1', cartSnapshot(), checkoutData);

    expect(first.id).toBe(1001);
    expect(second.id).toBe(1002);
    expect(first.status).toBe('new');
    expect(first.restaurantName).toBe('Smash Burger Co.');
    expect(first.items).toEqual([{ productId: 17, name: 'Classic Burger', price: 29.99, quantity: 2 }]);
    expect(first.contact.lastName).toBe('Nowak');
    expect(JSON.parse(localStorage.getItem('foodapp-orders')!).length).toBe(2);
  });

  it('should keep the price from the moment of ordering, even if the menu changes later', () => {
    const service = TestBed.inject(Orders);
    const cart = cartSnapshot();
    const order = service.placeOrder('user-1', cart, checkoutData);

    cart.items[0].product.price = 99;

    expect(service.getAll()()[0].items[0].price).toBe(29.99);
    expect(order.items[0].price).toBe(29.99);
  });

  it('should find one order by number, and the orders of one user, newest first', () => {
    const service = TestBed.inject(Orders);
    service.placeOrder('anna', cartSnapshot(), checkoutData);
    service.placeOrder('bartek', cartSnapshot(), checkoutData);
    service.placeOrder('anna', cartSnapshot(), checkoutData);

    expect(service.getById(1002)?.userId).toBe('bartek');
    expect(service.getById(9999)).toBeUndefined();
    expect(service.getForUser('anna').map((order) => order.id)).toEqual([1003, 1001]);
    expect(service.getForUser('nikt')).toEqual([]);
  });

  it('should change the status of one order and save it', () => {
    const service = TestBed.inject(Orders);
    service.placeOrder('anna', cartSnapshot(), checkoutData);
    service.placeOrder('anna', cartSnapshot(), checkoutData);

    service.changeStatus(1001, 'preparing');

    expect(service.getById(1001)?.status).toBe('preparing');
    expect(service.getById(1002)?.status).toBe('new');
    expect(JSON.parse(localStorage.getItem('foodapp-orders')!)[0].status).toBe('preparing');
  });
});
