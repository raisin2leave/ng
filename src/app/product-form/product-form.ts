import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, min, minLength, required } from '@angular/forms/signals';
import { Product, ProductFormValue } from '../models/menu';
import { Menus } from '../services/menus';
import { DataState } from '../data-state/data-state';

@Component({
  selector: 'app-product-form',
  imports: [FormField, RouterLink, DataState],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  private menusService = inject(Menus);
  private router = inject(Router);

  restaurantId = input.required<string>();
  categoryId = input<string>();
  productId = input<string>();

  isEditing = computed(() => this.productId() !== undefined);

  productResource = this.menusService.loadProduct(() => toNumber(this.productId()));

  existingProduct = computed(() => (this.productResource.hasValue() ? this.productResource.value() : undefined));

  categoryResource = this.menusService.loadCategory(() => {
    if (this.isEditing()) {
      return this.existingProduct()?.categoryId;
    }

    return toNumber(this.categoryId());
  });

  category = computed(() => (this.categoryResource.hasValue() ? this.categoryResource.value() : undefined));

  notFound = computed(() => isNotFound(this.productResource.error()) || isNotFound(this.categoryResource.error()));

  loadFailed = computed(() => {
    if (this.notFound()) {
      return false;
    }

    return this.productResource.error() !== undefined || this.categoryResource.error() !== undefined;
  });

  isLoading = computed(() => this.productResource.isLoading() || this.categoryResource.isLoading());

  triedToSave = signal(false);
  saving = signal(false);
  saveError = signal('');

  product = linkedSignal<ProductFormValue>(() => {
    const existing = this.existingProduct();
    return existing ? toFormValue(existing) : emptyFormValue();
  });

  productForm = form(this.product, (schema) => {
    required(schema.name, { message: 'Nazwa produktu jest wymagana.' });
    minLength(schema.name, 3, { message: 'Nazwa musi mieć co najmniej 3 znaki.' });

    required(schema.description, { message: 'Opis jest wymagany.' });
    minLength(schema.description, 10, { message: 'Opis musi mieć co najmniej 10 znaków.' });

    required(schema.price, { message: 'Podaj cenę.' });
    min(schema.price, 0.01, { message: 'Cena musi być większa od 0.' });
  });

  reload() {
    if (this.productResource.error() !== undefined) {
      this.productResource.reload();
    }

    if (this.categoryResource.error() !== undefined) {
      this.categoryResource.reload();
    }
  }

  showErrors(field: { touched(): boolean; invalid(): boolean }) {
    return (field.touched() || this.triedToSave()) && field.invalid();
  }

  save(event: Event) {
    event.preventDefault();

    const category = this.category();

    if (!category) {
      return;
    }

    if (this.productForm().invalid()) {
      this.triedToSave.set(true);
      return;
    }

    const existing = this.existingProduct();
    let request = this.menusService.addProduct(category.id, this.product());

    if (existing) {
      request = this.menusService.updateProduct(existing.id, this.product());
    }

    this.saving.set(true);
    this.saveError.set('');

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/menus', this.restaurantId()]);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Nie udało się zapisać produktu. Sprawdź połączenie i spróbuj ponownie.');
      },
    });
  }
}

function toNumber(value: string | undefined) {
  return value === undefined ? undefined : Number(value);
}

function isNotFound(error: unknown) {
  return error instanceof HttpErrorResponse && error.status === 404;
}

function emptyFormValue(): ProductFormValue {
  return { name: '', description: '', price: 0, imageUrl: '', isAvailable: true };
}

function toFormValue(product: Product): ProductFormValue {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
  };
}
