import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard, loggedInGuard } from './auth-guards';
import { Auth } from '../services/auth';
import { Users } from '../services/users';
import { routes } from '../app.routes';

describe('Guards', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function ask(guard: typeof adminGuard) {
    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    if (result instanceof UrlTree) {
      return 'redirect to ' + TestBed.inject(Router).serializeUrl(result);
    }

    return result;
  }

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

  describe('adminGuard', () => {
    it('should send a visitor who is not logged in to the login page (FR-06)', () => {
      expect(ask(adminGuard)).toBe('redirect to /login');
    });

    it('should keep a customer out of the admin panel (FR-05)', () => {
      logInAsCustomer();
      expect(ask(adminGuard)).toBe('redirect to /forbidden');
    });

    it('should let an admin in', () => {
      TestBed.inject(Auth).login('admin@foodapp.pl', 'Admin123!');
      expect(ask(adminGuard)).toBe(true);
    });
  });

  describe('loggedInGuard', () => {
    it('should send a visitor who is not logged in to the login page', () => {
      expect(ask(loggedInGuard)).toBe('redirect to /login');
    });

    it('should let any logged-in user in', () => {
      logInAsCustomer();
      expect(ask(loggedInGuard)).toBe(true);
    });
  });

  it('should protect every page under /admin with the admin guard', () => {
    const adminRoute = routes.find((route) => route.path === 'admin')!;

    expect(adminRoute.canActivateChild).toEqual([adminGuard]);
    expect(adminRoute.children!.map((child) => child.path)).toEqual([
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
    expect(routes.some((route) => route.path?.startsWith('admin/'))).toBe(false);
  });
});
