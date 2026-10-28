import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, min, minLength, required, validate } from '@angular/forms/signals';
import { CuisineType, cuisineOptions, RestaurantFormValue } from '../models/restaurant';
import { Restaurants } from '../services/restaurants';

@Component({
  selector: 'app-restaurant-form',
  imports: [FormField, RouterLink],
  templateUrl: './restaurant-form.html',
  styleUrl: './restaurant-form.scss',
})
export class RestaurantForm implements OnInit {
  private restaurantsService = inject(Restaurants);
  private router = inject(Router);

  id = input<string>();

  cuisineOptions = cuisineOptions;
  notFound = signal(false);
  triedToSave = signal(false);

  restaurant = signal<RestaurantFormValue>({
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

  ngOnInit() {
    const id = this.id();

    if (id === undefined) {
      return;
    }

    const existing = this.restaurantsService.getById(Number(id));

    if (!existing) {
      this.notFound.set(true);
      return;
    }

    this.restaurant.set({
      name: existing.name,
      description: existing.description,
      address: existing.address,
      cuisine: existing.cuisine,
      imageUrl: existing.imageUrl ?? '',
      deliveryTimeMin: existing.deliveryTimeMin,
      deliveryTimeMax: existing.deliveryTimeMax,
      deliveryFee: existing.deliveryFee,
      minimumOrderValue: existing.minimumOrderValue,
      isActive: existing.isActive,
    });
  }

  save(event: Event) {
    event.preventDefault();

    if (this.restaurantForm().invalid()) {
      this.triedToSave.set(true);
      return;
    }

    const id = this.id();

    if (id === undefined) {
      this.restaurantsService.create(this.restaurant());
    } else {
      this.restaurantsService.update(Number(id), this.restaurant());
    }

    this.router.navigate(['/admin']);
  }
}
