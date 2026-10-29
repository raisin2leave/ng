import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Register } from './register';
import { Users } from '../services/users';

describe('Register', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function createPage() {
    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  function typeInto(page: HTMLElement, selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function fillValidForm(page: HTMLElement) {
    typeInto(page, '#reg-name', 'Anna');
    typeInto(page, '#reg-email', 'anna@example.com');
    typeInto(page, '#reg-password', 'bezpieczne1');
    typeInto(page, '#reg-repeat', 'bezpieczne1');
    typeInto(page, '#reg-street', 'Marszałkowska');
    typeInto(page, '#reg-building', '10');
    typeInto(page, '#reg-postal', '00-001');
    typeInto(page, '#reg-city', 'Warszawa');
  }

  function errorTexts(page: HTMLElement) {
    return [...page.querySelectorAll('.invalid-feedback')].map((e) => e.textContent?.trim());
  }

  it('should not let the user choose a role', () => {
    const { page } = createPage();
    expect(page.querySelector('[id*="role"]')).toBeNull();
    expect(page.textContent?.toLowerCase()).not.toContain('rola');
  });

  it('should create a customer account and show a link to the login page', () => {
    const { fixture, page } = createPage();
    fillValidForm(page);
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const users = TestBed.inject(Users).getAll()();
    const anna = users.find((u) => u.email === 'anna@example.com')!;
    expect(anna.role).toBe('customer');
    expect(anna.role === 'customer' && anna.deliveryAddress.city).toBe('Warszawa');
    expect(page.textContent).toContain('Konto zostało utworzone');
    expect(page.querySelector('a[href="/login"]')).not.toBeNull();
  });

  it('should show what is missing when the form is empty', () => {
    const { fixture, page } = createPage();
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = errorTexts(page);
    expect(errors).toContain('Imię jest wymagane.');
    expect(errors).toContain('Adres e-mail jest wymagany.');
    expect(errors).toContain('Hasło jest wymagane.');
    expect(errors).toContain('Ulica jest wymagana.');
    expect(errors).toContain('Miasto jest wymagane.');
    expect(TestBed.inject(Users).getAll()().length).toBe(1);
  });

  it('should refuse an e-mail that already has an account', () => {
    const { fixture, page } = createPage();
    fillValidForm(page);
    typeInto(page, '#reg-email', 'ADMIN@foodapp.pl');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(errorTexts(page)).toEqual(['Konto z tym adresem e-mail już istnieje.']);
    expect(TestBed.inject(Users).getAll()().length).toBe(1);
  });

  it('should check e-mail format, password length, repeated password and postal code', () => {
    const { fixture, page } = createPage();
    fillValidForm(page);
    typeInto(page, '#reg-email', 'to-nie-jest-email');
    typeInto(page, '#reg-password', 'krotkie');
    typeInto(page, '#reg-repeat', 'inne-haslo');
    typeInto(page, '#reg-postal', '00001');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(errorTexts(page)).toEqual([
      'Podaj poprawny adres e-mail.',
      'Hasło musi mieć co najmniej 8 znaków.',
      'Hasła nie są takie same.',
      'Kod pocztowy musi mieć format 00-000.',
    ]);
  });
});
