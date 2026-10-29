import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { email, form, FormField, minLength, pattern, required, validate } from '@angular/forms/signals';
import { Users } from '../services/users';
import { FieldErrors } from '../field-errors/field-errors';

type RegisterFormValue = {
  name: string;
  email: string;
  password: string;
  repeatPassword: string;
  phone: string;
  deliveryAddress: {
    street: string;
    buildingNumber: string;
    apartmentNumber: string;
    postalCode: string;
    city: string;
  };
};

@Component({
  selector: 'app-register',
  imports: [FormField, RouterLink, FieldErrors],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private usersService = inject(Users);

  triedToSave = signal(false);
  createdName = signal('');

  account = signal<RegisterFormValue>({
    name: '',
    email: '',
    password: '',
    repeatPassword: '',
    phone: '',
    deliveryAddress: {
      street: '',
      buildingNumber: '',
      apartmentNumber: '',
      postalCode: '',
      city: '',
    },
  });

  registerForm = form(this.account, (schema) => {
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

    required(schema.deliveryAddress.street, { message: 'Ulica jest wymagana.' });
    required(schema.deliveryAddress.buildingNumber, { message: 'Numer budynku jest wymagany.' });
    required(schema.deliveryAddress.postalCode, { message: 'Kod pocztowy jest wymagany.' });
    pattern(schema.deliveryAddress.postalCode, /^\d{2}-\d{3}$/, {
      message: 'Kod pocztowy musi mieć format 00-000.',
    });
    required(schema.deliveryAddress.city, { message: 'Miasto jest wymagane.' });
  });

  showErrors(field: { touched(): boolean; invalid(): boolean }) {
    return (field.touched() || this.triedToSave()) && field.invalid();
  }

  save(event: Event) {
    event.preventDefault();

    if (this.registerForm().invalid()) {
      this.triedToSave.set(true);
      return;
    }

    const value = this.account();
    const address = value.deliveryAddress;

    const created = this.usersService.registerCustomer({
      name: value.name,
      email: value.email,
      password: value.password,
      phone: value.phone,
      deliveryAddress: {
        street: address.street.trim(),
        buildingNumber: address.buildingNumber.trim(),
        apartmentNumber: address.apartmentNumber.trim() || undefined,
        postalCode: address.postalCode.trim(),
        city: address.city.trim(),
      },
    });

    if (created) {
      this.createdName.set(created.name);
    }
  }
}
