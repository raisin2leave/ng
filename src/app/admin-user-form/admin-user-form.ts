import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { email, form, FormField, minLength, pattern, required, validate } from '@angular/forms/signals';
import { Auth } from '../services/auth';
import { Users } from '../services/users';
import { FieldErrors } from '../field-errors/field-errors';

@Component({
  selector: 'app-admin-user-form',
  imports: [FormField, RouterLink, FieldErrors],
  templateUrl: './admin-user-form.html',
  styleUrl: './admin-user-form.scss',
})
export class AdminUserForm {
  private usersService = inject(Users);
  private auth = inject(Auth);
  private router = inject(Router);

  triedToSave = signal(false);

  account = signal({
    name: '',
    email: '',
    password: '',
    repeatPassword: '',
    phone: '',
  });

  adminForm = form(this.account, (schema) => {
    required(schema.name, { message: 'Imię jest wymagane.' });
    minLength(schema.name, 2, { message: 'Imię musi mieć co najmniej 2 znaki.' });

    required(schema.email, { message: 'Adres e-mail jest wymagany.' });
    email(schema.email, { message: 'Podaj poprawny adres e-mail.' });
    validate(schema.email, ({ value }) => {
      if (this.usersService.isEmailTaken(value())) {
        return { kind: 'emailTaken', message: 'Konto z tym adresem e-mail już istnieje.' };
      }

      return null;
    });

    required(schema.password, { message: 'Hasło jest wymagane.' });
    minLength(schema.password, 8, { message: 'Hasło musi mieć co najmniej 8 znaków.' });

    required(schema.repeatPassword, { message: 'Powtórz hasło.' });
    validate(schema.repeatPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schema.password)) {
        return { kind: 'passwordsDifferent', message: 'Hasła nie są takie same.' };
      }

      return null;
    });

    pattern(schema.phone, /^[0-9 +-]{9,15}$|^$/, {
      message: 'Telefon może zawierać tylko cyfry, spacje, + i - (9–15 znaków).',
    });
  });

  showErrors(field: { touched(): boolean; invalid(): boolean }) {
    return (field.touched() || this.triedToSave()) && field.invalid();
  }

  save(event: Event) {
    event.preventDefault();

    if (!this.auth.isAdmin()) {
      return;
    }

    if (this.adminForm().invalid()) {
      this.triedToSave.set(true);
      return;
    }

    const value = this.account();
    const created = this.usersService.createAdmin({
      name: value.name,
      email: value.email,
      password: value.password,
      phone: value.phone,
    });

    if (created) {
      this.router.navigate(['/admin/users']);
    }
  }
}
