import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminOrders } from './admin-orders';
import { makeTestOrder } from '../testing/order-test-data';
import { API_URL } from '../api';
import { fakeServer, provideTestApi, settle } from '../testing/api-test';

describe('AdminOrders (admin FR-04, FR-05, orders from the API)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideTestApi()] });
  });

  async function createPage() {
    const fixture = TestBed.createComponent(AdminOrders);
    fixture.detectChanges();
    TestBed.tick();
    fakeServer()
      .expectOne(`${API_URL}/orders`)
      .flush([makeTestOrder(1, 'anna'), makeTestOrder(2, 'bartek', 2, 'delivered'), makeTestOrder(3, 'anna')]);
    await settle();
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const orderNumbers = () => [...page.querySelectorAll('tbody tr td:first-child')].map((td) => td.textContent?.trim());
    return { fixture, page, orderNumbers };
  }

  it('should show the orders of ALL customers, newest first (FR-04)', async () => {
    const { page, orderNumbers } = await createPage();

    expect(orderNumbers()).toEqual(['3', '2', '1']);
    expect(page.textContent).toContain('Trattoria Bella Italia');
    expect(page.querySelector('a[href="/admin/orders/2"]')).not.toBeNull();
  });

  it('should filter the orders by status, with a count for each status (FR-05)', async () => {
    const { fixture, page, orderNumbers } = await createPage();
    const options = [...page.querySelectorAll('#order-status-filter option')].map((o) => o.textContent?.trim());

    expect(options).toEqual([
      'Wszystkie (3)',
      'Nowe (2)',
      'Przyjęte (0)',
      'W przygotowaniu (0)',
      'Gotowe (0)',
      'W dostawie (0)',
      'Dostarczone (1)',
      'Anulowane (0)',
    ]);

    fixture.componentInstance.statusFilter.set('new');
    fixture.detectChanges();
    expect(orderNumbers()).toEqual(['3', '1']);

    fixture.componentInstance.statusFilter.set('cancelled');
    fixture.detectChanges();
    expect(page.textContent).toContain('Brak zamówień do wyświetlenia.');
  });

  it('should show Loading, then "Unable to load data." with Retry when the API fails', async () => {
    const fixture = TestBed.createComponent(AdminOrders);
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Ładowanie zamówień…');

    fakeServer().expectOne(`${API_URL}/orders`).flush('down', { status: 500, statusText: 'Server Error' });
    await settle();
    fixture.detectChanges();

    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Unable to load data.');
    expect(page.querySelector('table')).toBeNull();
  });
});
