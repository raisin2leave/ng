import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { email, form, FormField, required } from '@angular/forms/signals';
import { Auth } from '../services/auth';
import { FieldErrors } from '../field-errors/field-errors';

@Component({
  selector: 'app-login',
  imports: [FormField, RouterLink, FieldErrors],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  currentUser = this.auth.currentUser;

  triedToLogIn = signal(false);
  loginFailed = signal(false);

  credentials = signal({ email: '', password: '' });

  loginForm = form(this.credentials, (schema) => {
    required(schema.email, { message: 'Podaj adres e-mail.' });
    email(schema.email, { message: 'Podaj poprawny adres e-mail.' });
    required(schema.password, { message: 'Podaj hasło.' });
  });

  showErrors(field: { touched(): boolean; invalid(): boolean }) {
    return (field.touched() || this.triedToLogIn()) && field.invalid();
  }

  logIn(event: Event) {
    event.preventDefault();
    this.loginFailed.set(false);

    if (this.loginForm().invalid()) {
      this.triedToLogIn.set(true);
      return;
    }

    const typed = this.credentials();

    if (!this.auth.login(typed.email, typed.password)) {
      this.loginFailed.set(true);
      return;
    }

    this.router.navigate(['/']);
  }
}
