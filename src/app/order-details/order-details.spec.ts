import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrderDetails } from './order-details';
import { createCustomer, logIn, placeTestOrder } from '../testing/order-test-data';

describe('OrderDetails (customer FR-02)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function openOrder(id: number) {
    const fixture = TestBed.createComponent(OrderDetails);
    fixture.componentRef.setInput('id', String(id));
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return page;
  }

  it('should show the details of my own order', () => {
    const anna = createCustomer('Anna', 'anna@example.com');
    placeTestOrder(anna.id);
    logIn('anna@example.com');

    const page = openOrder(1001);

    expect(page.textContent).toContain('Zamówienie nr 1001');
    expect(page.textContent).toContain('Classic Burger');
    expect(page.textContent).toContain('Kwota do zapłaty');
  });

  it("should not show someone else's order", () => {
    const anna = createCustomer('Anna', 'anna@example.com');
    createCustomer('Bartek', 'bartek@example.com');
    placeTestOrder(anna.id);
    logIn('bartek@example.com');

    const page = openOrder(1001);

    expect(page.textContent).toContain('Nie znaleziono zamówienia.');
    expect(page.textContent).not.toContain('Classic Burger');
  });

  it('should say when an order does not exist', () => {
    createCustomer('Anna', 'anna@example.com');
    logIn('anna@example.com');

    expect(openOrder(4242).textContent).toContain('Nie znaleziono zamówienia.');
  });
});
