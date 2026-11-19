import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminOrderDetails } from './admin-order-details';
import { Orders } from '../services/orders';
import { Users } from '../services/users';
import { createCustomer, placeTestOrder } from '../testing/order-test-data';

describe('AdminOrderDetails (admin FR-06, FR-07)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    const anna = createCustomer('Anna', 'anna@example.com');
    placeTestOrder(anna.id);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function openOrder(id: number) {
    const fixture = TestBed.createComponent(AdminOrderDetails);
    fixture.componentRef.setInput('id', String(id));
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  async function openOrderAndWait(id: number) {
    const opened = openOrder(id);
    await opened.fixture.whenStable();
    return opened;
  }

  function chooseStatus(fixture: ReturnType<typeof openOrder>['fixture'], page: HTMLElement, status: string) {
    const select = page.querySelector<HTMLSelectElement>('#new-status')!;
    select.value = status;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    page.querySelector<HTMLFormElement>('.status-panel')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it("should show the details of any customer's order, with the customer's account (FR-06)", () => {
    const { page } = openOrder(1001);

    expect(page.textContent).toContain('Zamówienie nr 1001');
    expect(page.textContent).toContain('Classic Burger');
    expect(page.textContent).toContain('anna@example.com');
  });

  it('should change the status and show it at once (FR-07)', async () => {
    const { fixture, page } = await openOrderAndWait(1001);

    chooseStatus(fixture, page, 'in-delivery');

    expect(TestBed.inject(Orders).getById(1001)?.status).toBe('in-delivery');
    expect(page.querySelector('.order-header .badge')?.textContent?.trim()).toBe('W dostawie');
    expect(page.textContent).toContain('Status zamówienia nr 1001 zmieniono na „W dostawie”.');
  });

  it('should ask before cancelling, and do nothing if the admin says no', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { fixture, page } = await openOrderAndWait(1001);

    chooseStatus(fixture, page, 'cancelled');
    expect(confirmSpy).toHaveBeenCalledWith('Czy na pewno anulować zamówienie nr 1001?');
    expect(TestBed.inject(Orders).getById(1001)?.status).toBe('new');

    confirmSpy.mockReturnValue(true);
    chooseStatus(fixture, page, 'cancelled');
    expect(TestBed.inject(Orders).getById(1001)?.status).toBe('cancelled');
  });

  it('should still show an order whose customer account was deleted', () => {
    const anna = TestBed.inject(Users).getAll()().find((u) => u.email === 'anna@example.com')!;
    TestBed.inject(Users).deleteUser(anna.id);

    const { page } = openOrder(1001);

    expect(page.textContent).toContain('Zamówienie nr 1001');
    expect(page.textContent).toContain('zostało usunięte');
  });

  it('should say when the order does not exist', () => {
    expect(openOrder(4242).page.textContent).toContain('Nie znaleziono zamówienia.');
  });
});
