import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { email, form, FormField, pattern, required, validate } from '@angular/forms/signals';
import { Order, paymentMethods, PaymentMethod } from '../models/order';
import { Auth } from '../services/auth';
import { Cart } from '../services/cart';
import { Orders } from '../services/orders';
import { Restaurants } from '../services/restaurants';
import { FieldErrors } from '../field-errors/field-errors';

type CheckoutFormValue = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  city: string;
  paymentMethod: PaymentMethod | '';
};

@Component({
  selector: 'app-checkout',
  imports: [FormField, RouterLink, FieldErrors],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  private auth = inject(Auth);
  private ordersService = inject(Orders);
  private restaurantsService = inject(Restaurants);
  cart = inject(Cart);

  paymentMethods = paymentMethods;

  triedToSend = signal(false);
  placedOrder = signal<Order | undefined>(undefined);
  problem = signal('');

  checkout = signal<CheckoutFormValue>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
    postalCode: '',
    city: '',
    paymentMethod: '',
  });

  checkoutForm = form(this.checkout, (schema) => {
    required(schema.firstName, { message: 'Imię jest wymagane.' });
    required(schema.lastName, { message: 'Nazwisko jest wymagane.' });

    required(schema.email, { message: 'Adres e-mail jest wymagany.' });
    email(schema.email, { message: 'Podaj poprawny adres e-mail.' });

    required(schema.phone, { message: 'Telefon jest wymagany.' });
    pattern(schema.phone, /^[0-9 +-]{9,15}$/, {
      message: 'Telefon może zawierać tylko cyfry, spacje, + i - (9–15 znaków).',
    });

    required(schema.street, { message: 'Ulica jest wymagana.' });
    required(schema.buildingNumber, { message: 'Numer budynku jest wymagany.' });

    required(schema.postalCode, { message: 'Kod pocztowy jest wymagany.' });
    validate(schema.postalCode, ({ value }) => {
      if (value() !== '' && !/^\d{2}-\d{3}$/.test(value())) {
        return { kind: 'postalCodeFormat', message: 'Kod pocztowy musi mieć format 00-000.' };
      }

      return null;
    });

    required(schema.city, { message: 'Miasto jest wymagane.' });
    required(schema.paymentMethod, { message: 'Wybierz metodę płatności.' });
  });

  ngOnInit() {
    const user = this.auth.currentUser();

    if (!user) {
      return;
    }

    const value = { ...this.checkout() };
    value.firstName = user.name;
    value.email = user.email;
    value.phone = user.phone ?? '';

    if (user.role === 'customer') {
      value.street = user.deliveryAddress.street;
      value.buildingNumber = user.deliveryAddress.buildingNumber;
      value.apartmentNumber = user.deliveryAddress.apartmentNumber ?? '';
      value.postalCode = user.deliveryAddress.postalCode;
      value.city = user.deliveryAddress.city;
    }

    this.checkout.set(value);
  }

  showErrors(field: { touched(): boolean; invalid(): boolean }) {
    return (field.touched() || this.triedToSend()) && field.invalid();
  }

  send(event: Event) {
    event.preventDefault();
    this.problem.set('');

    if (this.checkoutForm().invalid()) {
      this.triedToSend.set(true);
      return;
    }

    const user = this.auth.currentUser();
    const restaurant = this.cart.restaurant();

    if (!user || !restaurant || this.cart.isEmpty()) {
      this.problem.set('Twój koszyk jest pusty — nie można złożyć zamówienia.');
      return;
    }

    if (!this.restaurantsService.getById(restaurant.id)?.isActive) {
      this.problem.set('Ta restauracja jest teraz nieczynna — nie można złożyć zamówienia.');
      return;
    }

    const value = this.checkout();

    if (value.paymentMethod === '') {
      return;
    }

    const order = this.ordersService.placeOrder(
      user.id,
      {
        restaurant: restaurant,
        items: this.cart.items(),
        subtotal: this.cart.subtotal(),
        deliveryFee: this.cart.deliveryFee(),
        total: this.cart.total(),
      },
      {
        contact: {
          firstName: value.firstName.trim(),
          lastName: value.lastName.trim(),
          email: value.email.trim().toLowerCase(),
          phone: value.phone.trim(),
        },
        deliveryAddress: {
          street: value.street.trim(),
          buildingNumber: value.buildingNumber.trim(),
          apartmentNumber: value.apartmentNumber.trim() || undefined,
          postalCode: value.postalCode.trim(),
          city: value.city.trim(),
        },
        paymentMethod: value.paymentMethod,
      },
    );

    this.cart.clear();
    this.placedOrder.set(order);
  }
}
