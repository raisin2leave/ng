import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, min, minLength, required, validate } from '@angular/forms/signals';
import { CuisineType, cuisineOptions, Restaurant, RestaurantFormValue } from '../models/restaurant';
import { Restaurants } from '../services/restaurants';
import { DataState } from '../data-state/data-state';

@Component({
  selector: 'app-restaurant-form',
  imports: [FormField, RouterLink, DataState],
  templateUrl: './restaurant-form.html',
  styleUrl: './restaurant-form.scss',
})
export class RestaurantForm {
  restaurantsService = inject(Restaurants);
  private router = inject(Router);

  id = input<string>();

  cuisineOptions = cuisineOptions;
  triedToSave = signal(false);
  saving = signal(false);
  saveError = signal('');

  existing = computed(() => {
    const id = this.id();
    return id === undefined ? undefined : this.restaurantsService.getById(Number(id));
  });

  waitingForData = computed(() => this.id() !== undefined && !this.restaurantsService.hasLoaded());
  notFound = computed(() => this.id() !== undefined && this.restaurantsService.hasLoaded() && !this.existing());

  restaurant = linkedSignal<RestaurantFormValue>(() => {
    const existing = this.existing();
    return existing ? toFormValue(existing) : emptyFormValue();
  });

  restaurantForm = form(this.restaurant, (schema) => {
    required(schema.name, { message: 'Nazwa jest wymagana.' });
    minLength(schema.name, 3, { message: 'Nazwa musi mieć co najmniej 3 znaki.' });

    required(schema.description, { message: 'Opis jest wymagany.' });
    minLength(schema.description, 20, { message: 'Opis musi mieć co najmniej 20 znaków.' });

    required(schema.deliveryFee, { message: 'Podaj koszt dostawy.' });
    min(schema.deliveryFee, 0, { message: 'Koszt dostawy nie może być ujemny.' });

    required(schema.minimumOrderValue, { message: 'Podaj minimalną wartość zamówienia.' });
    min(schema.minimumOrderValue, 0, { message: 'Minimalna wartość zamówienia nie może być ujemna.' });

    required(schema.deliveryTimeMin, { message: 'Podaj minimalny czas dostawy.' });
    min(schema.deliveryTimeMin, 1, { message: 'Czas dostawy musi być większy od 0.' });

    required(schema.deliveryTimeMax, { message: 'Podaj maksymalny czas dostawy.' });
    validate(schema.deliveryTimeMax, ({ value, valueOf }) => {
      if (value() < valueOf(schema.deliveryTimeMin)) {
        return {
          kind: 'deliveryTimeRange',
          message: 'Czas „do” nie może być krótszy niż czas „od”.',
        };
      }

      return null;
    });
  });

  showErrors(field: { touched(): boolean; invalid(): boolean }) {
    return (field.touched() || this.triedToSave()) && field.invalid();
  }

  save(event: Event) {
    event.preventDefault();

    if (this.restaurantForm().invalid()) {
      this.triedToSave.set(true);
      return;
    }

    const id = this.id();
    const request =
      id === undefined
        ? this.restaurantsService.create(this.restaurant())
        : this.restaurantsService.update(Number(id), this.restaurant());

    this.saving.set(true);
    this.saveError.set('');

    request.subscribe({
      next: () => this.router.navigate(['/admin']),
      error: () => {
        this.saving.set(false);
        this.saveError.set('Nie udało się zapisać restauracji. Sprawdź połączenie i spróbuj ponownie.');
      },
    });
  }
}

function emptyFormValue(): RestaurantFormValue {
  return {
    name: '',
    description: '',
    address: '',
    cuisine: CuisineType.Polish,
    imageUrl: '',
    deliveryTimeMin: 10,
    deliveryTimeMax: 30,
    deliveryFee: 10,
    minimumOrderValue: 20,
    isActive: true,
  };
}

function toFormValue(restaurant: Restaurant): RestaurantFormValue {
  return {
    name: restaurant.name,
    description: restaurant.description,
    address: restaurant.address,
    cuisine: restaurant.cuisine,
    imageUrl: restaurant.imageUrl ?? '',
    deliveryTimeMin: restaurant.deliveryTimeMin,
    deliveryTimeMax: restaurant.deliveryTimeMax,
    deliveryFee: restaurant.deliveryFee,
    minimumOrderValue: restaurant.minimumOrderValue,
    isActive: restaurant.isActive,
  };
}
