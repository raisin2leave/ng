import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminUserForm } from './admin-user-form';
import { Auth } from '../services/auth';
import { Users } from '../services/users';

describe('AdminUserForm', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'admin/users', children: [] }])],
    });
  });

  function createPage() {
    const fixture = TestBed.createComponent(AdminUserForm);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  function typeInto(page: HTMLElement, selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function fillForm(page: HTMLElement, emailAddress: string) {
    typeInto(page, '#admin-name', 'Druga Adminka');
    typeInto(page, '#admin-email', emailAddress);
    typeInto(page, '#admin-password', 'super-haslo-1');
    typeInto(page, '#admin-repeat', 'super-haslo-1');
  }

  it('should let an admin create a new account with the admin role', () => {
    TestBed.inject(Auth).login('admin@foodapp.pl', 'Admin123!');
    const { page } = createPage();

    fillForm(page, 'adminka@foodapp.pl');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));

    const created = TestBed.inject(Users).findByLogin('adminka@foodapp.pl', 'super-haslo-1');
    expect(created?.role).toBe('admin');
    expect(created && 'deliveryAddress' in created).toBe(false);
  });

  it('should have no role field to choose', () => {
    const { page } = createPage();
    expect(page.querySelector('select')).toBeNull();
    expect(page.querySelector('[id*="role"]')).toBeNull();
  });

  it('should refuse an e-mail that already exists', () => {
    TestBed.inject(Auth).login('admin@foodapp.pl', 'Admin123!');
    const { fixture, page } = createPage();

    fillForm(page, 'admin@foodapp.pl');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(page.textContent).toContain('Konto z tym adresem e-mail już istnieje.');
    expect(TestBed.inject(Users).getAll()().length).toBe(1);
  });

  it('should not create anything when the person is not an admin', () => {
    const { page } = createPage();

    fillForm(page, 'intruz@example.com');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(TestBed.inject(Users).getAll()().length).toBe(1);
  });
});
