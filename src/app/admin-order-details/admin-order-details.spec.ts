import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminOrderDetails } from './admin-order-details';
import { Users } from '../services/users';
import { createCustomer, makeTestOrder } from '../testing/order-test-data';
import { API_URL } from '../api';
import { fakeServer, provideTestApi, settle } from '../testing/api-test';

describe('AdminOrderDetails (admin FR-06, FR-07, order in the API)', () => {
  let annaId = '';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideTestApi()] });
    annaId = createCustomer('Anna', 'anna@example.com').id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function openOrder(id = 1) {
    const fixture = TestBed.createComponent(AdminOrderDetails);
    fixture.componentRef.setInput('id', String(id));
    fixture.detectChanges();
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/orders/${id}`).flush(makeTestOrder(id, annaId));
    await settle();
    fixture.detectChanges();
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  function chooseStatus(fixture: { detectChanges(): void }, page: HTMLElement, status: string) {
    const select = page.querySelector<HTMLSelectElement>('#new-status')!;
    select.value = status;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    page.querySelector<HTMLFormElement>('.status-panel')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it("should show the details of any customer's order, with the customer's account (FR-06)", async () => {
    const { page } = await openOrder();

    expect(page.textContent).toContain('Zamówienie nr 1');
    expect(page.textContent).toContain('Classic Burger');
    expect(page.textContent).toContain('anna@example.com');
  });

  it('should change the status with PATCH /orders/:id and show it at once (FR-07)', async () => {
    const { fixture, page } = await openOrder();

    chooseStatus(fixture, page, 'in-delivery');
    const request = fakeServer().expectOne(`${API_URL}/orders/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'in-delivery' });
    request.flush(makeTestOrder(1, annaId, 3, 'in-delivery'));
    fixture.detectChanges();

    expect(page.querySelector('.order-header .badge')?.textContent?.trim()).toBe('W dostawie');
    expect(page.textContent).toContain('Status zamówienia nr 1 zmieniono na „W dostawie”.');
  });

  it('should ask before cancelling, and send nothing if the admin says no', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { fixture, page } = await openOrder();

    chooseStatus(fixture, page, 'cancelled');
    expect(confirmSpy).toHaveBeenCalledWith('Czy na pewno anulować zamówienie nr 1?');
    fakeServer().expectNone(`${API_URL}/orders/1`);

    confirmSpy.mockReturnValue(true);
    chooseStatus(fixture, page, 'cancelled');
    expect(fakeServer().expectOne(`${API_URL}/orders/1`).request.body).toEqual({ status: 'cancelled' });
  });

  it('should show a message when the status could not be saved', async () => {
    const { fixture, page } = await openOrder();

    chooseStatus(fixture, page, 'ready');
    fakeServer().expectOne(`${API_URL}/orders/1`).flush('down', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(page.querySelector('.alert-danger')?.textContent).toContain('Nie udało się zmienić statusu.');
    expect(page.querySelector('.order-header .badge')?.textContent?.trim()).toBe('Nowe');
  });

  it('should still show an order whose customer account was deleted', async () => {
    TestBed.inject(Users).deleteUser(annaId);

    const { page } = await openOrder();

    expect(page.textContent).toContain('Zamówienie nr 1');
    expect(page.textContent).toContain('zostało usunięte');
  });

  it('should say when the order does not exist (404)', async () => {
    const fixture = TestBed.createComponent(AdminOrderDetails);
    fixture.componentRef.setInput('id', '4242');
    fixture.detectChanges();
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/orders/4242`).flush('Not found', { status: 404, statusText: 'Not Found' });
    await settle();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nie znaleziono zamówienia.');
  });
});
