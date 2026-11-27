import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IfRole } from './if-role';
import { Auth } from '../services/auth';
import { createCustomer, logIn } from '../testing/order-test-data';

@Component({
  imports: [IfRole],
  template: `<a *appIfRole="'admin'" class="admin-link">Panel admina</a>`,
})
class Host {}

describe('IfRole directive', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function adminLink() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return () => {
      fixture.detectChanges();
      return fixture.nativeElement.querySelector('.admin-link');
    };
  }

  it('should hide the element from guests and customers', () => {
    createCustomer('Anna', 'anna@example.com');
    const link = adminLink();
    expect(link()).toBeNull();

    logIn('anna@example.com');
    expect(link()).toBeNull();
  });

  it('should show the element to an admin and hide it again after logout', () => {
    const auth = TestBed.inject(Auth);
    const link = adminLink();
    auth.login('admin@foodapp.pl', 'Admin123!');
    expect(link()?.textContent).toBe('Panel admina');

    auth.logout();
    expect(link()).toBeNull();
  });
});
