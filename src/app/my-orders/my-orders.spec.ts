import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MyOrders } from './my-orders';
import { createCustomer, logIn, makeTestOrder } from '../testing/order-test-data';
import { routes } from '../app.routes';
import { loggedInGuard } from '../guards/auth-guards';
import { API_URL } from '../api';
import { fakeServer, provideTestApi, settle } from '../testing/api-test';

describe('MyOrders (customer FR-01, orders from the API)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideTestApi()] });
  });

  function createPage() {
    const fixture = TestBed.createComponent(MyOrders);
    fixture.detectChanges();
    TestBed.tick();
    const page: HTMLElement = fixture.nativeElement;
    const rows = () => [...page.querySelectorAll('tbody tr')].map((row) => row.textContent?.replace(/\s+/g, ' ').trim());
    return { fixture, page, rows };
  }

  it('should be available only to logged-in users', () => {
    expect(routes.find((route) => route.path === 'orders')!.canActivate).toEqual([loggedInGuard]);
    expect(routes.find((route) => route.path === 'orders/:id')!.canActivate).toEqual([loggedInGuard]);
  });

  it('should ask the API only for my orders and list them newest first, with status and a details link', async () => {
    const anna = createCustomer('Anna', 'anna@example.com');
    logIn('anna@example.com');
    const { fixture, page, rows } = createPage();

    expect(page.querySelector('[role="status"]')?.textContent).toContain('Ładowanie zamówień…');

    fakeServer()
      .expectOne(`${API_URL}/orders?userId=${anna.id}`)
      .flush([makeTestOrder(1, anna.id), makeTestOrder(3, anna.id, 2)]);
    await settle();
    fixture.detectChanges();

    expect(rows().length).toBe(2);
    expect(rows()[0]).toContain('3');
    expect(rows()[0]).toContain('Trattoria Bella Italia');
    expect(rows()[0]).toContain('Nowe');
    expect(rows()[1]).toContain('Smash Burger Co.');
    expect(page.querySelector('a[href="/orders/3"]')).not.toBeNull();
  });

  it('Empty: should tell a user without orders that the list is empty', async () => {
    const anna = createCustomer('Anna', 'anna@example.com');
    logIn('anna@example.com');
    const { fixture, page } = createPage();

    fakeServer().expectOne(`${API_URL}/orders?userId=${anna.id}`).flush([]);
    await settle();
    fixture.detectChanges();

    expect(page.textContent).toContain('Nie masz jeszcze żadnych zamówień.');
  });

  it('Error: should show "Unable to load data." with Retry', async () => {
    const anna = createCustomer('Anna', 'anna@example.com');
    logIn('anna@example.com');
    const { fixture, page, rows } = createPage();

    fakeServer().expectOne(`${API_URL}/orders?userId=${anna.id}`).flush('down', { status: 500, statusText: 'Server Error' });
    await settle();
    fixture.detectChanges();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Unable to load data.');

    page.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/orders?userId=${anna.id}`).flush([makeTestOrder(1, anna.id)]);
    await settle();
    fixture.detectChanges();

    expect(rows().length).toBe(1);
  });
});
