import { TestBed } from '@angular/core/testing';
import { OrderView } from './order-view';
import { Order, OrderStatus, orderStatuses } from '../models/order';
import { testCheckout } from '../testing/order-test-data';
import { pln } from '../testing/format';

const testOrder: Order = {
  ...testCheckout,
  id: 1001,
  userId: 'anna',
  createdAt: '2026-11-19T12:30:00.000Z',
  restaurantId: 3,
  restaurantName: 'Smash Burger Co.',
  items: [
    { productId: 101, name: 'Classic Burger', price: 29.99, quantity: 2 },
    { productId: 112, name: 'Frytki z serem', price: 14.99, quantity: 1 },
  ],
  subtotal: 74.97,
  deliveryFee: 6.5,
  total: 81.47,
  status: 'new',
};

describe('OrderView', () => {
  function show(status: OrderStatus) {
    const fixture = TestBed.createComponent(OrderView);
    fixture.componentRef.setInput('order', { ...testOrder, status });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the products, the three amounts, contact, address and payment', () => {
    const page = show('new');
    const text = page.textContent!.replace(/\s+/g, ' ');
    const amounts = [...page.querySelectorAll('.totals div')].map(
      (row) => `${row.querySelector('dt')?.textContent} = ${row.querySelector('dd')?.textContent}`,
    );

    expect(text).toContain('Classic Burger');
    expect(text).toContain('59,98 zł');
    expect(amounts).toEqual([
      `Suma zamówienia = ${pln(74.97)}`,
      `Koszt dostawy = ${pln(6.5)}`,
      `Kwota do zapłaty = ${pln(81.47)}`,
    ]);
    expect(text).toContain('Anna Nowak');
    expect(text).toContain('ul. Prosta 12/4');
    expect(text).toContain('00-950 Warszawa');
    expect(text).toContain('Płatność online');
  });

  it('should show each of the 7 statuses from the lab in Polish (customer FR-03)', () => {
    const shown = orderStatuses.map((status) => show(status.value).querySelector('.order-header .badge')?.textContent?.trim());
    expect(shown).toEqual(['Nowe', 'Przyjęte', 'W przygotowaniu', 'Gotowe', 'W dostawie', 'Dostarczone', 'Anulowane']);
  });

  it('should highlight the current step and tick the finished ones', () => {
    const page = show('preparing');
    const current = page.querySelector('.steps li.current');
    const done = [...page.querySelectorAll('.steps li.done')].map((li) => li.textContent?.trim());

    expect(current?.textContent?.trim()).toBe('W przygotowaniu');
    expect(current?.getAttribute('aria-current')).toBe('step');
    expect(done).toEqual(['Nowe', 'Przyjęte']);
  });

  it('should show a clear message for a cancelled order instead of the steps', () => {
    const page = show('cancelled');
    expect(page.querySelector('.steps')).toBeNull();
    expect(page.textContent).toContain('To zamówienie zostało anulowane.');
  });

  it('should show the discount line only when the order had a discount', () => {
    expect(show('new').querySelector('.discount-row')).toBeNull();

    const fixture = TestBed.createComponent(OrderView);
    fixture.componentRef.setInput('order', { ...testOrder, discountCode: 'WITAJ10', discount: 7.5, total: 73.97 });
    fixture.detectChanges();
    const row = (fixture.nativeElement as HTMLElement).querySelector('.discount-row');

    expect(row?.textContent?.replace(/\s+/g, '')).toBe('Rabat(WITAJ10)−7,50zł');
  });
});
