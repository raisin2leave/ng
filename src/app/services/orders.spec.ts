import { TestBed } from '@angular/core/testing';
import { Orders } from './orders';
import { Restaurants } from './restaurants';
import { Menus } from './menus';
import { CheckoutData } from '../models/order';

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
    const restaurant = TestBed.inject(Restaurants).getById(3)!;
    const product = TestBed.inject(Menus).getByCuisine(restaurant.cuisine)!.categories[0].products[0];
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
    expect(first.items).toEqual([{ productId: 101, name: 'Classic Burger', price: 29.99, quantity: 2 }]);
    expect(first.contact.lastName).toBe('Nowak');
    expect(JSON.parse(localStorage.getItem('foodapp-orders')!).length).toBe(2);
  });

  it('should keep the price from the moment of ordering, even if the menu changes later', () => {
    const service = TestBed.inject(Orders);
    const order = service.placeOrder('user-1', cartSnapshot(), checkoutData);

    TestBed.inject(Menus).updateProduct(101, {
      name: 'Classic Burger',
      description: 'Nowy opis',
      price: 99,
      imageUrl: '',
      isAvailable: true,
    });

    expect(service.getAll()()[0].items[0].price).toBe(29.99);
    expect(order.items[0].price).toBe(29.99);
  });
});
