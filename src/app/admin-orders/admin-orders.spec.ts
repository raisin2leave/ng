import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminOrders } from './admin-orders';
import { Orders } from '../services/orders';
import { createCustomer, placeTestOrder } from '../testing/order-test-data';

describe('AdminOrders (admin FR-04, FR-05)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    const anna = createCustomer('Anna', 'anna@example.com');
    const bartek = createCustomer('Bartek', 'bartek@example.com');
    placeTestOrder(anna.id);
    placeTestOrder(bartek.id, 2);
    placeTestOrder(anna.id);
    TestBed.inject(Orders).changeStatus(1002, 'delivered');
  });

  function createPage() {
    const fixture = TestBed.createComponent(AdminOrders);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const orderNumbers = () => [...page.querySelectorAll('tbody tr td:first-child')].map((td) => td.textContent?.trim());
    return { fixture, page, orderNumbers };
  }

  it('should show the orders of ALL customers, newest first (FR-04)', () => {
    const { page, orderNumbers } = createPage();

    expect(orderNumbers()).toEqual(['1003', '1002', '1001']);
    expect(page.textContent).toContain('Trattoria Bella Italia');
    expect(page.querySelector('a[href="/admin/orders/1002"]')).not.toBeNull();
  });

  it('should filter the orders by status, with a count for each status (FR-05)', () => {
    const { fixture, page, orderNumbers } = createPage();
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
    expect(orderNumbers()).toEqual(['1003', '1001']);

    fixture.componentInstance.statusFilter.set('cancelled');
    fixture.detectChanges();
    expect(page.textContent).toContain('Brak zamówień do wyświetlenia.');
  });
});
