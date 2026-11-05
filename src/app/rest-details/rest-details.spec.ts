import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RestDetails } from './rest-details';
import { Cart } from '../services/cart';
import { Restaurants } from '../services/restaurants';
import { Menus } from '../services/menus';

describe('RestDetails', () => {
  it('should show the restaurant with the given id', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Pierogarnia Pod Aniołami');
    expect(page.textContent).toContain('Warszawa');
  });

  it('should show the menu of the restaurant cuisine, divided into categories', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const categories = [...page.querySelectorAll('.menu-category h3')].map((h) => h.textContent);
    expect(categories).toEqual(['Zupy', 'Pierogi', 'Dania główne', 'Desery']);
    expect(page.textContent).toContain('Pierogi ruskie');
  });

  it('should add available products to the shared cart', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.cart-summary')?.textContent).toContain('Koszyk jest pusty');

    const buttons = [...page.querySelectorAll<HTMLButtonElement>('app-product-card button')];
    const enabled = buttons.filter((b) => !b.disabled);
    enabled[0].click();
    enabled[0].click();
    enabled[1].click();
    fixture.detectChanges();

    expect(page.querySelector('.cart-summary')?.textContent).toContain('Koszyk: 3 szt.');
    expect(TestBed.inject(Cart).items().length).toBe(2);
  });

  it('should show a message and disable all "Dodaj do koszyka" buttons for a closed restaurant', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '18');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.querySelector('.closed-info')?.textContent).toContain('Restauracja jest teraz zamknięta');
    const buttons = [...page.querySelectorAll<HTMLButtonElement>('app-product-card button')];
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((b) => b.disabled)).toBe(true);
  });

  describe('product from another restaurant (FR-05)', () => {
    function openRestaurantWithForeignCart() {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const cart = TestBed.inject(Cart);
      const otherRestaurant = TestBed.inject(Restaurants).getById(2)!;
      const otherProduct = TestBed.inject(Menus).getByCuisine(otherRestaurant.cuisine)!.categories[0].products[0];
      cart.add(otherRestaurant, otherProduct);

      const fixture = TestBed.createComponent(RestDetails);
      fixture.componentRef.setInput('id', '1');
      fixture.detectChanges();
      const page: HTMLElement = fixture.nativeElement;

      const firstEnabled = [...page.querySelectorAll<HTMLButtonElement>('app-product-card button')].find((b) => !b.disabled)!;
      firstEnabled.click();
      fixture.detectChanges();

      const dialogButton = (text: string) =>
        [...page.querySelectorAll<HTMLButtonElement>('.dialog-box button')].find((b) => b.textContent?.includes(text))!;

      return { fixture, page, cart, dialogButton };
    }

    it('should show a dialog and keep the cart unchanged until the user decides', () => {
      const { page, cart } = openRestaurantWithForeignCart();

      expect(page.querySelector('[role="alertdialog"]')?.textContent).toContain('innej restauracji');
      expect(cart.restaurant()?.id).toBe(2);
      expect(cart.items().length).toBe(1);
    });

    it('should cancel adding the new product', () => {
      const { fixture, page, cart, dialogButton } = openRestaurantWithForeignCart();

      dialogButton('Anuluj dodawanie nowego produktu').click();
      fixture.detectChanges();

      expect(page.querySelector('[role="alertdialog"]')).toBeNull();
      expect(cart.restaurant()?.id).toBe(2);
    });

    it('should cancel the current order and start a new one with the new product', () => {
      const { fixture, page, cart, dialogButton } = openRestaurantWithForeignCart();

      dialogButton('Anuluj bieżące zamówienie i dodaj nowe').click();
      fixture.detectChanges();

      expect(page.querySelector('[role="alertdialog"]')).toBeNull();
      expect(cart.restaurant()?.id).toBe(1);
      expect(cart.items().length).toBe(1);
      expect(page.querySelector('.cart-summary')?.textContent).toContain('Koszyk: 1 szt.');
    });
  });

  it('should show a message for an unknown id', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '9999');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Nie znaleziono restauracji.');
  });
});
