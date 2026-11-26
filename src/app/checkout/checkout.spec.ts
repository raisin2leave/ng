import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Checkout } from './checkout';
import { Auth } from '../services/auth';
import { Cart } from '../services/cart';
import { Orders } from '../services/orders';
import { answerRestaurantList, provideTestApi, restaurantFromSeed, productFromSeed } from '../testing/api-test';
import { Users } from '../services/users';

describe('Checkout', () => {
  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideTestApi()] });
    await answerRestaurantList();

    TestBed.inject(Users).registerCustomer({
      name: 'Anna',
      email: 'anna@example.com',
      password: 'bezpieczne1',
      phone: '600100200',
      deliveryAddress: { street: 'Prosta', buildingNumber: '1', apartmentNumber: '4', postalCode: '00-001', city: 'Warszawa' },
    });
    TestBed.inject(Auth).login('anna@example.com', 'bezpieczne1');

    const restaurant = restaurantFromSeed(3);
    const product = productFromSeed(restaurant.id);
    const cart = TestBed.inject(Cart);
    cart.add(restaurant, product);
    cart.add(restaurant, product);
  });

  function createPage() {
    const fixture = TestBed.createComponent(Checkout);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  function typeInto(page: HTMLElement, selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('change'));
  }

  function send(fixture: ReturnType<typeof createPage>['fixture'], page: HTMLElement) {
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function errorTexts(page: HTMLElement) {
    return [...page.querySelectorAll('.invalid-feedback')].map((e) => e.textContent?.trim());
  }

  it('should have exactly the fields from the lab', () => {
    const { page } = createPage();
    const labels = [...page.querySelectorAll('form label')].map((l) => l.textContent?.replace('*', '').trim());
    expect(labels).toEqual([
      'Imię',
      'Nazwisko',
      'E-mail',
      'Telefon',
      'Ulica',
      'Numer budynku',
      'Numer mieszkania',
      'Kod pocztowy',
      'Miasto',
      'Metoda płatności',
    ]);
  });

  it('should pre-fill what it knows from the profile', () => {
    const { page } = createPage();
    expect(page.querySelector<HTMLInputElement>('#co-first-name')!.value).toBe('Anna');
    expect(page.querySelector<HTMLInputElement>('#co-email')!.value).toBe('anna@example.com');
    expect(page.querySelector<HTMLInputElement>('#co-city')!.value).toBe('Warszawa');
    expect(page.querySelector<HTMLInputElement>('#co-last-name')!.value).toBe('');
  });

  it('should NOT send an invalid form', () => {
    const { fixture, page } = createPage();
    typeInto(page, '#co-first-name', '');
    typeInto(page, '#co-postal', '00001');
    send(fixture, page);

    expect(errorTexts(page)).toEqual([
      'Imię jest wymagane.',
      'Nazwisko jest wymagane.',
      'Kod pocztowy musi mieć format 00-000.',
      'Wybierz metodę płatności.',
    ]);
    expect(TestBed.inject(Orders).getAll()().length).toBe(0);
    expect(TestBed.inject(Cart).isEmpty()).toBe(false);
  });

  it('should require all fields from the lab (an empty form)', () => {
    const { fixture, page } = createPage();
    for (const id of ['#co-first-name', '#co-email', '#co-phone', '#co-street', '#co-building', '#co-postal', '#co-city']) {
      typeInto(page, id, '');
    }
    send(fixture, page);

    expect(errorTexts(page)).toEqual([
      'Imię jest wymagane.',
      'Nazwisko jest wymagane.',
      'Adres e-mail jest wymagany.',
      'Telefon jest wymagany.',
      'Ulica jest wymagana.',
      'Numer budynku jest wymagany.',
      'Kod pocztowy jest wymagany.',
      'Miasto jest wymagane.',
      'Wybierz metodę płatności.',
    ]);
  });

  it('should send a valid form: save the order, empty the cart and confirm', () => {
    const { fixture, page } = createPage();
    typeInto(page, '#co-last-name', 'Nowak');
    typeInto(page, '#co-payment', 'on-delivery');
    send(fixture, page);

    const orders = TestBed.inject(Orders).getAll()();
    expect(orders.length).toBe(1);
    expect(orders[0].contact).toEqual({
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna@example.com',
      phone: '600100200',
    });
    expect(orders[0].deliveryAddress.apartmentNumber).toBe('4');
    expect(orders[0].paymentMethod).toBe('on-delivery');
    expect(orders[0].total).toBe(66.48);
    expect(TestBed.inject(Cart).isEmpty()).toBe(true);
    expect(page.textContent).toContain('Zamówienie nr 1001 zostało złożone');
  });

  it('should save the discount code and amount with the order', () => {
    TestBed.inject(Cart).applyDiscountCode('DARMOWADOSTAWA');
    const { fixture, page } = createPage();
    typeInto(page, '#co-last-name', 'Nowak');
    typeInto(page, '#co-payment', 'online');
    send(fixture, page);

    const order = TestBed.inject(Orders).getAll()()[0];
    expect(order.discountCode).toBe('DARMOWADOSTAWA');
    expect(order.discount).toBe(6.5);
    expect(order.total).toBe(59.98);
  });
});
