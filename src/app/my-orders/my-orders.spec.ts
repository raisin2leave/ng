import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MyOrders } from './my-orders';
import { createCustomer, logIn, placeTestOrder } from '../testing/order-test-data';
import { routes } from '../app.routes';
import { loggedInGuard } from '../guards/auth-guards';

describe('MyOrders (customer FR-01)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function createPage() {
    const fixture = TestBed.createComponent(MyOrders);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const rows = () => [...page.querySelectorAll('tbody tr')].map((row) => row.textContent?.replace(/\s+/g, ' ').trim());
    return { fixture, page, rows };
  }

  it('should be available only to logged-in users', () => {
    expect(routes.find((route) => route.path === 'orders')!.canActivate).toEqual([loggedInGuard]);
    expect(routes.find((route) => route.path === 'orders/:id')!.canActivate).toEqual([loggedInGuard]);
  });

  it('should list only my orders, newest first, with status and a details link', () => {
    const anna = createCustomer('Anna', 'anna@example.com');
    const bartek = createCustomer('Bartek', 'bartek@example.com');
    placeTestOrder(anna.id);
    placeTestOrder(bartek.id);
    placeTestOrder(anna.id, 2);
    logIn('anna@example.com');

    const { page, rows } = createPage();

    expect(rows().length).toBe(2);
    expect(rows()[0]).toContain('1003');
    expect(rows()[0]).toContain('Trattoria Bella Italia');
    expect(rows()[0]).toContain('Nowe');
    expect(rows()[1]).toContain('1001');
    expect(page.textContent).not.toContain('1002');
    expect(page.querySelector('a[href="/orders/1003"]')).not.toBeNull();
  });

  it('should tell a user without orders that the list is empty', () => {
    createCustomer('Anna', 'anna@example.com');
    logIn('anna@example.com');

    const { page } = createPage();

    expect(page.textContent).toContain('Nie masz jeszcze żadnych zamówień.');
  });
});
