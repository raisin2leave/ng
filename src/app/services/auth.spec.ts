import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start logged out', () => {
    const auth = TestBed.inject(Auth);
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.currentUser()).toBeUndefined();
  });

  it('should log in with the right password and remember the session', () => {
    const auth = TestBed.inject(Auth);

    expect(auth.login('admin@foodapp.pl', 'zle-haslo')).toBe(false);
    expect(auth.isLoggedIn()).toBe(false);

    expect(auth.login('ADMIN@foodapp.pl', 'Admin123!')).toBe(true);
    expect(auth.currentUser()?.name).toBe('Administrator');
    expect(auth.isAdmin()).toBe(true);
    expect(localStorage.getItem('foodapp-session')).toBe('admin-1');
  });

  it('should log out and forget the session', () => {
    const auth = TestBed.inject(Auth);
    auth.login('admin@foodapp.pl', 'Admin123!');

    auth.logout();

    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('foodapp-session')).toBeNull();
  });
});
