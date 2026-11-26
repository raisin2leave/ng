import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RestDetails } from './rest-details';
import { Cart } from '../services/cart';
import { API_URL } from '../api';
import { answerRestaurantList, fakeServer, provideTestApi, restaurantFromSeed, settle } from '../testing/api-test';
import { Menus } from '../services/menus';

describe('RestDetails', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideTestApi()] });
    await answerRestaurantList();
  });

  async function openDetails(id: number) {
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', String(id));
    fixture.detectChanges();
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/restaurants/${id}`).flush(restaurantFromSeed(id));
    await settle();
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  it('should show the restaurant with the given id', async () => {
    const { fixture, page } = await openDetails(1);
    expect(page.textContent).toContain('Pierogarnia Pod Aniołami');
    expect(page.textContent).toContain('Warszawa');
  });

  it('should show the menu of the restaurant cuisine, divided into categories', async () => {
    const { fixture, page } = await openDetails(1);
    const categories = [...page.querySelectorAll('.menu-category h3')].map((h) => h.textContent);
    expect(categories).toEqual(['Zupy', 'Pierogi', 'Dania główne', 'Desery']);
    expect(page.textContent).toContain('Pierogi ruskie');
  });

  it('should add available products to the shared cart', async () => {
    const { fixture, page } = await openDetails(1);
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

  it('should show a message and disable all "Dodaj do koszyka" buttons for a closed restaurant', async () => {
    const { fixture, page } = await openDetails(18);

    expect(page.querySelector('.closed-info')?.textContent).toContain('Restauracja jest teraz zamknięta');
    const buttons = [...page.querySelectorAll<HTMLButtonElement>('app-product-card button')];
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((b) => b.disabled)).toBe(true);
  });

  describe('product from another restaurant (FR-05)', () => {
    async function openRestaurantWithForeignCart() {
        const cart = TestBed.inject(Cart);
      const otherRestaurant = restaurantFromSeed(2);
      const otherProduct = TestBed.inject(Menus).getByCuisine(otherRestaurant.cuisine)!.categories[0].products[0];
      cart.add(otherRestaurant, otherProduct);

      const { fixture, page } = await openDetails(1);

      const firstEnabled = [...page.querySelectorAll<HTMLButtonElement>('app-product-card button')].find((b) => !b.disabled)!;
      firstEnabled.click();
      fixture.detectChanges();

      const dialogButton = (text: string) =>
        [...page.querySelectorAll<HTMLButtonElement>('.dialog-box button')].find((b) => b.textContent?.includes(text))!;

      return { fixture, page, cart, dialogButton };
    }

    it('should show a dialog and keep the cart unchanged until the user decides', async () => {
      const { page, cart } = await openRestaurantWithForeignCart();

      expect(page.querySelector('[role="alertdialog"]')?.textContent).toContain('innej restauracji');
      expect(cart.restaurant()?.id).toBe(2);
      expect(cart.items().length).toBe(1);
    });

    it('should cancel adding the new product', async () => {
      const { fixture, page, cart, dialogButton } = await openRestaurantWithForeignCart();

      dialogButton('Anuluj dodawanie nowego produktu').click();
      fixture.detectChanges();

      expect(page.querySelector('[role="alertdialog"]')).toBeNull();
      expect(cart.restaurant()?.id).toBe(2);
    });

    it('should cancel the current order and start a new one with the new product', async () => {
      const { fixture, page, cart, dialogButton } = await openRestaurantWithForeignCart();

      const buttonTexts = [...page.querySelectorAll('.dialog-box button')].map((b) => b.textContent?.trim());
      expect(buttonTexts).toEqual([
        'Anuluj dodawanie nowego produktu',
        'Anuluj bieżące zamówienie i dodaj nowe zamówienie',
      ]);

      dialogButton('Anuluj bieżące zamówienie i dodaj nowe zamówienie').click();
      fixture.detectChanges();

      expect(page.querySelector('[role="alertdialog"]')).toBeNull();
      expect(cart.restaurant()?.id).toBe(1);
      expect(cart.items().length).toBe(1);
      expect(page.querySelector('.cart-summary')?.textContent).toContain('Koszyk: 1 szt.');
    });
  });

  it('should say "not found" when the API answers 404', async () => {
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '9999');
    fixture.detectChanges();
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/restaurants/9999`).flush('Not found', { status: 404, statusText: 'Not Found' });
    await settle();
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.textContent).toContain('Nie znaleziono restauracji.');
    expect(page.textContent).not.toContain('Unable to load data.');
  });

  describe('loading states (Lab 7 FR-02)', () => {
    it('should load the details with its own request GET /restaurants/:id and show Loading meanwhile', async () => {
      const fixture = TestBed.createComponent(RestDetails);
      fixture.componentRef.setInput('id', '3');
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      const page: HTMLElement = fixture.nativeElement;

      expect(page.querySelector('[role="status"]')?.textContent).toContain('Ładowanie restauracji…');

      fakeServer().expectOne(`${API_URL}/restaurants/3`).flush(restaurantFromSeed(3));
      await settle();
      fixture.detectChanges();

      expect(page.querySelector('h1')?.textContent).toBe('Smash Burger Co.');
    });

    it('should show "Unable to load data." on a server error and load again after Retry', async () => {
      const fixture = TestBed.createComponent(RestDetails);
      fixture.componentRef.setInput('id', '3');
      fixture.detectChanges();
      TestBed.tick();
      fakeServer().expectOne(`${API_URL}/restaurants/3`).flush('down', { status: 500, statusText: 'Server Error' });
      await settle();
      fixture.detectChanges();
      const page: HTMLElement = fixture.nativeElement;

      expect(page.querySelector('[role="alert"]')?.textContent).toContain('Unable to load data.');

      page.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
      TestBed.tick();
      fakeServer().expectOne(`${API_URL}/restaurants/3`).flush(restaurantFromSeed(3));
      await settle();
      fixture.detectChanges();

      expect(page.querySelector('[role="alert"]')).toBeNull();
      expect(page.querySelector('h1')?.textContent).toBe('Smash Burger Co.');
    });
  });
});
