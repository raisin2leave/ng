import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminUsers } from './admin-users';
import { Auth } from '../services/auth';
import { Users } from '../services/users';

describe('AdminUsers', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    TestBed.inject(Users).registerCustomer({
      name: 'Anna',
      email: 'anna@example.com',
      password: 'bezpieczne1',
      phone: '',
      deliveryAddress: { street: 'Prosta', buildingNumber: '1', postalCode: '00-001', city: 'Warszawa' },
    });
    TestBed.inject(Auth).login('admin@foodapp.pl', 'Admin123!');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createPage() {
    const fixture = TestBed.createComponent(AdminUsers);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const rows = () => [...page.querySelectorAll('tbody tr')];
    const annaRow = () => rows().find((row) => row.textContent?.includes('anna@example.com'))!;
    return { fixture, page, rows, annaRow };
  }

  it('should list all users with their roles, without any passwords', () => {
    const { page, rows } = createPage();

    expect(rows().length).toBe(2);
    expect(page.textContent).toContain('administrator');
    expect(page.textContent).toContain('klient');
    expect(page.textContent).not.toContain('$2b$');
  });

  it('should filter the list to administrators only', () => {
    const { fixture, rows } = createPage();

    fixture.componentInstance.roleFilter.set('admin');
    fixture.detectChanges();

    expect(rows().length).toBe(1);
    expect(rows()[0].textContent).toContain('admin@foodapp.pl');
  });

  it('should not offer deleting your own account', () => {
    const { rows } = createPage();
    const myRow = rows().find((row) => row.textContent?.includes('admin@foodapp.pl'))!;

    expect(myRow.textContent).toContain('to Ty');
    expect(myRow.querySelector('.btn-outline-danger')).toBeNull();
  });

  it('should reset a password so the old one stops working', () => {
    const { fixture, page, annaRow } = createPage();

    annaRow().querySelector<HTMLButtonElement>('.btn-outline-primary')!.click();
    fixture.detectChanges();

    fixture.componentInstance.newPassword.set('krotkie');
    annaRow().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(page.textContent).toContain('Nowe hasło musi mieć co najmniej 8 znaków.');

    fixture.componentInstance.newPassword.set('nowe-haslo-123');
    annaRow().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const users = TestBed.inject(Users);
    expect(users.findByLogin('anna@example.com', 'bezpieczne1')).toBeUndefined();
    expect(users.findByLogin('anna@example.com', 'nowe-haslo-123')).toBeDefined();
    expect(page.textContent).toContain('Hasło użytkownika Anna zostało zmienione.');
  });

  it('should delete an account only after confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { fixture, rows, annaRow } = createPage();

    annaRow().querySelector<HTMLButtonElement>('.btn-outline-danger')!.click();
    fixture.detectChanges();
    expect(confirmSpy).toHaveBeenCalledWith('Czy na pewno usunąć konto „Anna” (anna@example.com)?');
    expect(rows().length).toBe(2);

    confirmSpy.mockReturnValue(true);
    annaRow().querySelector<HTMLButtonElement>('.btn-outline-danger')!.click();
    fixture.detectChanges();
    expect(rows().length).toBe(1);
    expect(TestBed.inject(Users).findByLogin('anna@example.com', 'bezpieczne1')).toBeUndefined();
  });
});
