import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { email, form, FormField, minLength, pattern, required, validate } from '@angular/forms/signals';
import { Auth } from '../services/auth';
import { Users } from '../services/users';
import { FieldErrors } from '../field-errors/field-errors';

type ProfileFormValue = {
  name: string;
  email: string;
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
  selector: 'app-profile',
  imports: [FormField, FieldErrors],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private auth = inject(Auth);
  private usersService = inject(Users);

  currentUser = this.auth.currentUser;
  isCustomer = computed(() => this.currentUser()?.role === 'customer');

  triedToSave = signal(false);
  saved = signal(false);

  profile = signal<ProfileFormValue>({
    name: '',
    email: '',
    phone: '',
    deliveryAddress: {
      street: '',
      buildingNumber: '',
      apartmentNumber: '',
      postalCode: '',
      city: '',
    },
  });

  profileForm = form(this.profile, (schema) => {
    required(schema.name, { message: 'Imię jest wymagane.' });
    minLength(schema.name, 2, { message: 'Imię musi mieć co najmniej 2 znaki.' });

    required(schema.email, { message: 'Adres e-mail jest wymagany.' });
    email(schema.email, { message: 'Podaj poprawny adres e-mail.' });
    validate(schema.email, ({ value }) => {
      const myId = this.currentUser()?.id ?? '';

      if (this.usersService.isEmailTaken(value(), myId)) {
        return { kind: 'emailTaken', message: 'Ten adres e-mail jest już używany przez inne konto.' };
      }

      return null;
    });

    pattern(schema.phone, /^[0-9 +-]{9,15}$|^$/, {
      message: 'Telefon może zawierać tylko cyfry, spacje, + i - (9–15 znaków).',
    });

    const onlyForCustomers = { when: () => this.isCustomer() };

    required(schema.deliveryAddress.street, { message: 'Ulica jest wymagana.', ...onlyForCustomers });
    required(schema.deliveryAddress.buildingNumber, { message: 'Numer budynku jest wymagany.', ...onlyForCustomers });
    required(schema.deliveryAddress.postalCode, { message: 'Kod pocztowy jest wymagany.', ...onlyForCustomers });
    required(schema.deliveryAddress.city, { message: 'Miasto jest wymagane.', ...onlyForCustomers });
    validate(schema.deliveryAddress.postalCode, ({ value }) => {
      if (this.isCustomer() && value() !== '' && !/^\d{2}-\d{3}$/.test(value())) {
        return { kind: 'postalCodeFormat', message: 'Kod pocztowy musi mieć format 00-000.' };
      }

      return null;
    });
  });

  ngOnInit() {
    const user = this.currentUser();

    if (!user) {
      return;
    }

    if (user.role === 'customer') {
      const address = user.deliveryAddress;

      this.profile.set({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        deliveryAddress: {
          street: address.street,
          buildingNumber: address.buildingNumber,
          apartmentNumber: address.apartmentNumber ?? '',
          postalCode: address.postalCode,
          city: address.city,
        },
      });
    } else {
      this.profile.set({
        ...this.profile(),
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
      });
    }
  }

  showErrors(field: { touched(): boolean; invalid(): boolean }) {
    return (field.touched() || this.triedToSave()) && field.invalid();
  }

  save(event: Event) {
    event.preventDefault();
    this.saved.set(false);

    const user = this.currentUser();

    if (!user) {
      return;
    }

    if (this.profileForm().invalid()) {
      this.triedToSave.set(true);
      return;
    }

    const value = this.profile();
    const address = value.deliveryAddress;

    const ok = this.usersService.updateProfile(user.id, {
      name: value.name,
      email: value.email,
      phone: value.phone,
      deliveryAddress: this.isCustomer()
        ? {
            street: address.street.trim(),
            buildingNumber: address.buildingNumber.trim(),
            apartmentNumber: address.apartmentNumber.trim() || undefined,
            postalCode: address.postalCode.trim(),
            city: address.city.trim(),
          }
        : undefined,
    });

    if (ok) {
      this.triedToSave.set(false);
      this.saved.set(true);
    }
  }
}
