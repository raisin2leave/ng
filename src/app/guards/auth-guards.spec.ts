import { TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router, UrlTree, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { adminGuard, loggedInGuard } from './auth-guards';
import { Auth } from '../services/auth';
import { Users } from '../services/users';
import { routes } from '../app.routes';
import { adminRoutes } from '../admin/admin.routes';
import { Login } from '../login/login';

describe('Guards', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function logInAsCustomer() {
    TestBed.inject(Users).registerCustomer({
      name: 'Anna',
      email: 'anna@example.com',
      password: 'bezpieczne1',
      phone: '',
      deliveryAddress: { street: 'Prosta', buildingNumber: '1', postalCode: '00-001', city: 'Warszawa' },
    });
    TestBed.inject(Auth).login('anna@example.com', 'bezpieczne1');
  }

  describe('guard decisions', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
    });

    function ask(runGuard: () => unknown) {
      const result = TestBed.runInInjectionContext(runGuard);

      if (result instanceof UrlTree) {
        return 'redirect to ' + TestBed.inject(Router).serializeUrl(result);
      }

      return result;
    }

    const askAdminGuard = () => ask(() => adminGuard({} as Route, []));
    const askLoggedInGuard = () => ask(() => loggedInGuard({} as never, {} as never));

    it('adminGuard: a visitor who is not logged in goes to login (FR-06)', () => {
      expect(askAdminGuard()).toBe('redirect to /login');
    });

    it('adminGuard: a customer is kept out (FR-05)', () => {
      logInAsCustomer();
      expect(askAdminGuard()).toBe('redirect to /forbidden');
    });

    it('adminGuard: an admin is let in', () => {
      TestBed.inject(Auth).login('admin@foodapp.pl', 'Admin123!');
      expect(askAdminGuard()).toBe(true);
    });

    it('loggedInGuard: a visitor goes to login, a logged-in user is let in', () => {
      expect(askLoggedInGuard()).toBe('redirect to /login');
      logInAsCustomer();
      expect(askLoggedInGuard()).toBe(true);
    });
  });

  describe('route setup', () => {
    it('should lazy-load the whole admin panel behind the admin guard', () => {
      const adminRoute = routes.find((route) => route.path === 'admin')!;

      expect(adminRoute.canMatch).toEqual([adminGuard]);
      expect(adminRoute.loadChildren).toBeDefined();
      expect(adminRoute.children).toBeUndefined();
      expect(routes.some((route) => route.path?.startsWith('admin/'))).toBe(false);
    });

    it('should contain all admin pages in the lazy admin routes file', () => {
      expect(adminRoutes.map((route) => route.path)).toEqual([
        '',
        'new',
        'edit/:id',
        'menus',
        'menus/:cuisine',
        'menus/:cuisine/new/:category',
        'menus/:cuisine/edit/:productId',
        'users',
        'users/new',
      ]);
    });
  });

  describe('real navigation (bonus: back to the wanted page after login)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideRouter(routes, withComponentInputBinding())],
      });
    });

    it('should send a visitor to login, remembering the wanted page, and return there after login', async () => {
      const harness = await RouterTestingHarness.create();
      const router = TestBed.inject(Router);

      await harness.navigateByUrl('/admin/users');
      expect(router.url).toBe('/login?returnUrl=%2Fadmin%2Fusers');

      const login = harness.routeDebugElement!.componentInstance as Login;
      login.credentials.set({ email: 'admin@foodapp.pl', password: 'Admin123!' });
      login.logIn(new Event('submit'));
      await harness.fixture.whenStable();

      expect(router.url).toBe('/admin/users');
      expect(harness.routeNativeElement?.textContent).toContain('Użytkownicy');
    });

    it('should show "Brak dostępu" to a customer who opens an admin page', async () => {
      logInAsCustomer();
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl('/admin');

      expect(TestBed.inject(Router).url).toBe('/forbidden');
    });

    it('should remember the profile page too', async () => {
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl('/profile');

      expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2Fprofile');
    });
  });
});
