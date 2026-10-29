import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Profile } from './profile';
import { Auth } from '../services/auth';
import { Users } from '../services/users';
import { routes } from '../app.routes';
import { loggedInGuard } from '../guards/auth-guards';

describe('Profile', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function registerAndLogIn() {
    TestBed.inject(Users).registerCustomer({
      name: 'Anna',
      email: 'anna@example.com',
      password: 'bezpieczne1',
      phone: '',
      deliveryAddress: { street: 'Prosta', buildingNumber: '1', postalCode: '00-001', city: 'Warszawa' },
    });
    TestBed.inject(Auth).login('anna@example.com', 'bezpieczne1');
  }

  function createPage() {
    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  function typeInto(page: HTMLElement, selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function submit(fixture: ReturnType<typeof createPage>['fixture'], page: HTMLElement) {
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('should be protected by the logged-in guard', () => {
    const profileRoute = routes.find((route) => route.path === 'profile')!;
    expect(profileRoute.canActivate).toEqual([loggedInGuard]);
  });

  it('should show the customer data and the role, with no role field to edit', () => {
    registerAndLogIn();
    const { page } = createPage();

    expect(page.querySelector<HTMLInputElement>('#profile-name')!.value).toBe('Anna');
    expect(page.querySelector<HTMLInputElement>('#profile-city')!.value).toBe('Warszawa');
    expect(page.textContent).toContain('klient');
    expect(page.querySelector('[id*="role"]')).toBeNull();
    expect(page.textContent).not.toContain('Hasło');
  });

  it('should save changes to the logged-in user only, keeping the role', () => {
    registerAndLogIn();
    const { fixture, page } = createPage();

    typeInto(page, '#profile-name', 'Anna Kowalska');
    typeInto(page, '#profile-city', 'Kraków');
    submit(fixture, page);

    const users = TestBed.inject(Users);
    const anna = users.getAll()().find((u) => u.email === 'anna@example.com')!;
    expect(anna.name).toBe('Anna Kowalska');
    expect(anna.role).toBe('customer');
    expect(anna.role === 'customer' && anna.deliveryAddress.city).toBe('Kraków');
    expect(users.getById('admin-1')!.name).toBe('Administrator');
    expect(page.textContent).toContain('Zmiany zostały zapisane.');
  });

  it("should not allow taking another account's e-mail", () => {
    registerAndLogIn();
    const { fixture, page } = createPage();

    typeInto(page, '#profile-email', 'admin@foodapp.pl');
    submit(fixture, page);

    const errors = [...page.querySelectorAll('.invalid-feedback')].map((e) => e.textContent?.trim());
    expect(errors).toEqual(['Ten adres e-mail jest już używany przez inne konto.']);
    expect(TestBed.inject(Auth).currentUser()!.email).toBe('anna@example.com');
  });

  it('should let an admin edit their profile without any address fields', () => {
    TestBed.inject(Auth).login('admin@foodapp.pl', 'Admin123!');
    const { fixture, page } = createPage();

    expect(page.querySelector('#profile-street')).toBeNull();
    expect(page.textContent).toContain('administrator');

    typeInto(page, '#profile-name', 'Główny Admin');
    submit(fixture, page);

    const admin = TestBed.inject(Users).getById('admin-1')!;
    expect(admin.name).toBe('Główny Admin');
    expect(admin.role).toBe('admin');
    expect('deliveryAddress' in admin).toBe(false);
  });
});
