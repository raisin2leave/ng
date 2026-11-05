import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';
import { Auth } from '../services/auth';
import { Users } from '../services/users';
import { Cart } from '../services/cart';
import { Restaurants } from '../services/restaurants';
import { Menus } from '../services/menus';

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function createHeader() {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const links = () => [...page.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    return { fixture, page, links };
  }

  it('should show login and register links when nobody is logged in', () => {
    const { page, links } = createHeader();
    expect(links()).toContain('/');
    expect(links()).toContain('/login');
    expect(links()).toContain('/register');
    expect(links()).not.toContain('/admin');
    expect(page.textContent).not.toContain('Wyloguj');
  });

  it('should show the logged-in admin, the admin panel link and a logout button', () => {
    TestBed.inject(Auth).login('admin@foodapp.pl', 'Admin123!');
    const { page, links } = createHeader();

    expect(page.textContent).toContain('Administrator');
    expect(links()).toContain('/admin');
    expect(links()).not.toContain('/login');
    expect(page.querySelector('button')?.textContent).toContain('Wyloguj');
  });

  it('should show a customer name but no admin panel link', () => {
    TestBed.inject(Users).registerCustomer({
      name: 'Anna',
      email: 'anna@example.com',
      password: 'bezpieczne1',
      phone: '',
      deliveryAddress: { street: 'Prosta', buildingNumber: '1', postalCode: '00-001', city: 'Warszawa' },
    });
    TestBed.inject(Auth).login('anna@example.com', 'bezpieczne1');
    const { page, links } = createHeader();

    expect(page.textContent).toContain('Anna');
    expect(links()).not.toContain('/admin');
  });

  it('should log out when "Wyloguj" is clicked', () => {
    const auth = TestBed.inject(Auth);
    auth.login('admin@foodapp.pl', 'Admin123!');
    const { fixture, page, links } = createHeader();

    page.querySelector<HTMLButtonElement>('button')!.click();
    fixture.detectChanges();

    expect(auth.isLoggedIn()).toBe(false);
    expect(links()).toContain('/login');
    expect(page.textContent).not.toContain('Administrator');
  });

  it('should link to the cart and show how many products are in it', () => {
    const { fixture, page, links } = createHeader();
    expect(links()).toContain('/cart');
    expect(page.querySelector('.cart-link .badge')).toBeNull();

    const restaurant = TestBed.inject(Restaurants).getById(1)!;
    const product = TestBed.inject(Menus).getByCuisine(restaurant.cuisine)!.categories[0].products[0];
    const cart = TestBed.inject(Cart);
    cart.add(restaurant, product);
    cart.add(restaurant, product);
    fixture.detectChanges();

    expect(page.querySelector('.cart-link .badge')?.textContent).toBe('2');
  });
});
