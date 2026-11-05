import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartPage } from './cart-page';
import { Cart } from '../services/cart';
import { Restaurants } from '../services/restaurants';
import { Menus } from '../services/menus';

describe('CartPage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function fillCartAndOpenPage() {
    const restaurant = TestBed.inject(Restaurants).getById(1)!;
    const products = TestBed.inject(Menus).getByCuisine(restaurant.cuisine)!.categories.flatMap((category) => category.products);
    const cart = TestBed.inject(Cart);
    cart.add(restaurant, products[0]);
    cart.add(restaurant, products[1]);

    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    const rows = () => [...page.querySelectorAll<HTMLElement>('.cart-item')];
    const buttonIn = (row: HTMLElement, label: string) =>
      row.querySelector<HTMLButtonElement>(`button[aria-label^="${label}"]`)!;

    return { fixture, page, cart, restaurant, products, rows, buttonIn };
  }

  it('should show a message and no summary when the cart is empty', () => {
    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.textContent).toContain('Twój koszyk jest pusty.');
    expect(page.querySelector('.summary')).toBeNull();
  });

  it('should list the products with the restaurant name (FR-01)', () => {
    const { page, rows, restaurant, products } = fillCartAndOpenPage();

    expect(page.textContent).toContain(restaurant.name);
    expect(rows().length).toBe(2);
    expect(rows()[0].textContent).toContain(products[0].name);
  });

  it('should change the quantity with + and − buttons (FR-02)', () => {
    const { fixture, cart, rows, buttonIn } = fillCartAndOpenPage();

    expect(buttonIn(rows()[0], 'Zmniejsz').disabled).toBe(true);

    buttonIn(rows()[0], 'Zwiększ').click();
    buttonIn(rows()[0], 'Zwiększ').click();
    fixture.detectChanges();
    expect(cart.items()[0].quantity).toBe(3);

    buttonIn(rows()[0], 'Zmniejsz').click();
    fixture.detectChanges();
    expect(cart.items()[0].quantity).toBe(2);
  });

  it('should change the quantity typed into the number field and fix wrong values (FR-02)', () => {
    const { fixture, cart, rows } = fillCartAndOpenPage();
    const field = rows()[0].querySelector('input')!;

    field.value = '4';
    field.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(cart.items()[0].quantity).toBe(4);

    field.value = '';
    field.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(cart.items()[0].quantity).toBe(4);
    expect(field.value).toBe('4');

    field.value = '0';
    field.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(cart.items()[0].quantity).toBe(1);
    expect(field.value).toBe('1');
  });

  it('should remove a product (FR-03)', () => {
    const { fixture, page, cart, rows, buttonIn } = fillCartAndOpenPage();

    buttonIn(rows()[0], 'Usuń').click();
    fixture.detectChanges();
    expect(rows().length).toBe(1);

    buttonIn(rows()[0], 'Usuń').click();
    fixture.detectChanges();
    expect(cart.isEmpty()).toBe(true);
    expect(page.textContent).toContain('Twój koszyk jest pusty.');
  });

  it('should show subtotal, delivery fee and the amount to pay (FR-04)', () => {
    const { page, restaurant, products } = fillCartAndOpenPage();
    const subtotal = products[0].price + products[1].price;
    const amounts = [...page.querySelectorAll('.summary div')].map(
      (row) => `${row.querySelector('dt')!.textContent!.trim()} ${row.querySelector('dd')!.textContent!.trim()}`,
    );

    expect(amounts).toEqual([
      `Suma zamówienia ${subtotal.toFixed(2)} zł`,
      `Koszt dostawy ${restaurant.deliveryFee.toFixed(2)} zł`,
      `Kwota do zapłaty ${(subtotal + restaurant.deliveryFee).toFixed(2)} zł`,
    ]);
  });
});
