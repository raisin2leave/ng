import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Login } from './login';
import { Auth } from '../services/auth';

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', children: [] }])] });
  });

  function createPage() {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  function typeInto(page: HTMLElement, selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  it('should log in with the right e-mail and password and go to the home page', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
    const { page } = createPage();

    typeInto(page, '#login-email', 'admin@foodapp.pl');
    typeInto(page, '#login-password', 'Admin123!');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(TestBed.inject(Auth).currentUser()?.name).toBe('Administrator');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should show one general message for a wrong password', () => {
    const { fixture, page } = createPage();

    typeInto(page, '#login-email', 'admin@foodapp.pl');
    typeInto(page, '#login-password', 'zle-haslo');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(TestBed.inject(Auth).isLoggedIn()).toBe(false);
    expect(page.textContent).toContain('Nieprawidłowy e-mail lub hasło.');
  });

  it('should ask for both fields when they are empty', () => {
    const { fixture, page } = createPage();

    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = [...page.querySelectorAll('.invalid-feedback')].map((e) => e.textContent?.trim());
    expect(errors).toEqual(['Podaj adres e-mail.', 'Podaj hasło.']);
  });

  it('should tell an already logged-in user who they are instead of showing the form', () => {
    TestBed.inject(Auth).login('admin@foodapp.pl', 'Admin123!');
    const { page } = createPage();

    expect(page.querySelector('form')).toBeNull();
    expect(page.textContent).toContain('Jesteś już zalogowany jako Administrator');
  });
});
