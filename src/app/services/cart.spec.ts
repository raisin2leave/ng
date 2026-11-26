import { TestBed } from '@angular/core/testing';
import { Cart } from './cart';
import { CuisineType, Restaurant } from '../models/restaurant';
import { Product } from '../models/menu';

function makeRestaurant(id: number, deliveryFee: number): Restaurant {
  return {
    id: id,
    name: `Restauracja ${id}`,
    description: '',
    address: '',
    cuisine: CuisineType.Polish,
    rating: 4,
    deliveryTimeMin: 20,
    deliveryTimeMax: 40,
    deliveryFee: deliveryFee,
    minimumOrderValue: 30,
    isActive: true,
  };
}

function makeProduct(id: number, price: number): Product {
  return {
    id: id,
    categoryId: 1,
    name: `Produkt ${id}`,
    description: '',
    price: price,
    imageUrl: '',
    isAvailable: true,
  };
}

const pierogarnia = makeRestaurant(1, 8.99);
const pizzeria = makeRestaurant(2, 0);
const pierogi = makeProduct(101, 24.5);
const zurek = makeProduct(102, 18);

describe('Cart service', () => {
  it('should start empty with all sums at zero', () => {
    const cart = TestBed.inject(Cart);

    expect(cart.isEmpty()).toBe(true);
    expect(cart.itemCount()).toBe(0);
    expect(cart.subtotal()).toBe(0);
    expect(cart.deliveryFee()).toBe(0);
    expect(cart.total()).toBe(0);
  });

  it('should add products and increase quantity when the same product is added again', () => {
    const cart = TestBed.inject(Cart);

    expect(cart.add(pierogarnia, pierogi)).toBe('added');
    cart.add(pierogarnia, pierogi);
    cart.add(pierogarnia, zurek);

    expect(cart.items().length).toBe(2);
    expect(cart.items()[0].quantity).toBe(2);
    expect(cart.itemCount()).toBe(3);
    expect(cart.restaurant()?.id).toBe(1);
  });

  it('should calculate subtotal, delivery fee and total', () => {
    const cart = TestBed.inject(Cart);

    cart.add(pierogarnia, pierogi);
    cart.add(pierogarnia, pierogi);
    cart.add(pierogarnia, zurek);

    expect(cart.subtotal()).toBe(67);
    expect(cart.deliveryFee()).toBe(8.99);
    expect(cart.total()).toBe(75.99);
  });

  it('should keep quantity between 1 and 99 and ignore text that is not a number', () => {
    const cart = TestBed.inject(Cart);
    cart.add(pierogarnia, pierogi);

    cart.setQuantity(101, 5);
    expect(cart.items()[0].quantity).toBe(5);

    cart.setQuantity(101, 0);
    expect(cart.items()[0].quantity).toBe(1);

    cart.setQuantity(101, 500);
    expect(cart.items()[0].quantity).toBe(99);

    cart.setQuantity(101, 2.7);
    expect(cart.items()[0].quantity).toBe(2);

    cart.setQuantity(101, NaN);
    expect(cart.items()[0].quantity).toBe(2);
  });

  it('should change the quantity step by step using the current quantity', () => {
    const cart = TestBed.inject(Cart);
    cart.add(pierogarnia, pierogi);

    cart.changeQuantityBy(101, 1);
    cart.changeQuantityBy(101, 1);
    expect(cart.items()[0].quantity).toBe(3);

    cart.changeQuantityBy(101, -5);
    expect(cart.items()[0].quantity).toBe(1);
  });

  it('should remove a product and forget the restaurant when the cart becomes empty', () => {
    const cart = TestBed.inject(Cart);
    cart.add(pierogarnia, pierogi);
    cart.add(pierogarnia, zurek);

    cart.remove(101);
    expect(cart.items().length).toBe(1);
    expect(cart.restaurant()?.id).toBe(1);

    cart.remove(102);
    expect(cart.isEmpty()).toBe(true);
    expect(cart.restaurant()).toBeUndefined();
  });

  it('should refuse a product from another restaurant without changing the cart', () => {
    const cart = TestBed.inject(Cart);
    cart.add(pierogarnia, pierogi);

    expect(cart.add(pizzeria, zurek)).toBe('other-restaurant');
    expect(cart.items().length).toBe(1);
    expect(cart.restaurant()?.id).toBe(1);
  });

  it('should refuse products from a closed restaurant', () => {
    const cart = TestBed.inject(Cart);
    const closed = { ...pizzeria, isActive: false };

    expect(cart.add(closed, zurek)).toBe('restaurant-closed');
    expect(cart.isEmpty()).toBe(true);

    cart.add(pierogarnia, pierogi);
    cart.replaceWith(closed, zurek);
    expect(cart.restaurant()?.id).toBe(1);
    expect(cart.items().length).toBe(1);
  });

  it('should replace the whole cart with the product from the new restaurant', () => {
    const cart = TestBed.inject(Cart);
    cart.add(pierogarnia, pierogi);
    cart.add(pierogarnia, zurek);

    cart.replaceWith(pizzeria, zurek);

    expect(cart.items().length).toBe(1);
    expect(cart.items()[0].product.id).toBe(102);
    expect(cart.restaurant()?.id).toBe(2);
    expect(cart.deliveryFee()).toBe(0);
  });

  describe('discount codes (bonus)', () => {
    it('should refuse an unknown code and accept a known one in any letter case', () => {
      const cart = TestBed.inject(Cart);
      cart.add(pierogarnia, pierogi);

      expect(cart.applyDiscountCode('NIEMA')).toBe(false);
      expect(cart.discountCode()).toBeUndefined();

      expect(cart.applyDiscountCode('  witaj10 ')).toBe(true);
      expect(cart.discountCode()?.code).toBe('WITAJ10');
    });

    it('WITAJ10 should take 10% off the products, not the delivery', () => {
      const cart = TestBed.inject(Cart);
      cart.add(pierogarnia, pierogi);
      cart.add(pierogarnia, zurek);
      cart.applyDiscountCode('WITAJ10');

      expect(cart.subtotal()).toBe(42.5);
      expect(cart.discount()).toBe(4.25);
      expect(cart.total()).toBe(47.24);
    });

    it('DARMOWADOSTAWA should remove the delivery fee', () => {
      const cart = TestBed.inject(Cart);
      cart.add(pierogarnia, pierogi);
      cart.applyDiscountCode('DARMOWADOSTAWA');

      expect(cart.discount()).toBe(8.99);
      expect(cart.total()).toBe(24.5);
    });

    it('MINUS20 should work only from 80 zł and say how much is missing', () => {
      const cart = TestBed.inject(Cart);
      cart.add(pierogarnia, pierogi);
      cart.applyDiscountCode('MINUS20');

      expect(cart.discount()).toBe(0);
      expect(cart.discountMissingAmount()).toBe(55.5);

      cart.setQuantity(pierogi.id, 4);
      expect(cart.subtotal()).toBe(98);
      expect(cart.discountMissingAmount()).toBe(0);
      expect(cart.discount()).toBe(20);
      expect(cart.total()).toBe(86.99);
    });

    it('should forget the code when the code is removed or the cart is emptied', () => {
      const cart = TestBed.inject(Cart);
      cart.add(pierogarnia, pierogi);
      cart.applyDiscountCode('WITAJ10');

      cart.removeDiscountCode();
      expect(cart.discount()).toBe(0);

      cart.applyDiscountCode('WITAJ10');
      cart.remove(pierogi.id);
      expect(cart.discountCode()).toBeUndefined();

      cart.add(pierogarnia, pierogi);
      cart.applyDiscountCode('WITAJ10');
      cart.replaceWith(pizzeria, zurek);
      expect(cart.discountCode()).toBeUndefined();
    });
  });
});
