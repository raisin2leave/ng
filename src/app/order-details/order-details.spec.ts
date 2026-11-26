import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrderDetails } from './order-details';
import { createCustomer, logIn, makeTestOrder } from '../testing/order-test-data';
import { API_URL } from '../api';
import { fakeServer, provideTestApi, settle } from '../testing/api-test';

describe('OrderDetails (customer FR-02, order from the API)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideTestApi()] });
  });

  async function openOrder(id: number, answer: (request: ReturnType<ReturnType<typeof fakeServer>['expectOne']>) => void) {
    const fixture = TestBed.createComponent(OrderDetails);
    fixture.componentRef.setInput('id', String(id));
    fixture.detectChanges();
    TestBed.tick();
    answer(fakeServer().expectOne(`${API_URL}/orders/${id}`));
    await settle();
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return page;
  }

  it('should show the details of my own order', async () => {
    const anna = createCustomer('Anna', 'anna@example.com');
    logIn('anna@example.com');

    const page = await openOrder(1, (request) => request.flush(makeTestOrder(1, anna.id)));

    expect(page.textContent).toContain('Zamówienie nr 1');
    expect(page.textContent).toContain('Classic Burger');
    expect(page.textContent).toContain('Kwota do zapłaty');
  });

  it("should not show someone else's order", async () => {
    const anna = createCustomer('Anna', 'anna@example.com');
    createCustomer('Bartek', 'bartek@example.com');
    logIn('bartek@example.com');

    const page = await openOrder(1, (request) => request.flush(makeTestOrder(1, anna.id)));

    expect(page.textContent).toContain('Nie znaleziono zamówienia.');
    expect(page.textContent).not.toContain('Classic Burger');
  });

  it('should say when an order does not exist (404)', async () => {
    createCustomer('Anna', 'anna@example.com');
    logIn('anna@example.com');

    const page = await openOrder(4242, (request) => request.flush('Not found', { status: 404, statusText: 'Not Found' }));

    expect(page.textContent).toContain('Nie znaleziono zamówienia.');
  });

  it('should show "Unable to load data." with Retry on a server error', async () => {
    createCustomer('Anna', 'anna@example.com');
    logIn('anna@example.com');

    const page = await openOrder(1, (request) => request.flush('down', { status: 500, statusText: 'Server Error' }));

    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Unable to load data.');
    expect(page.textContent).not.toContain('Nie znaleziono zamówienia.');
  });
});
