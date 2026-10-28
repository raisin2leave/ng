import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, min, minLength, required } from '@angular/forms/signals';
import { ProductFormValue } from '../models/menu';
import { Menus } from '../services/menus';

@Component({
  selector: 'app-product-form',
  imports: [FormField, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {
  private menusService = inject(Menus);
  private router = inject(Router);

  cuisine = input.required<string>();
  category = input<string>();
  productId = input<string>();

  categoryName = signal('');
  notFound = signal(false);
  triedToSave = signal(false);

  product = signal<ProductFormValue>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isAvailable: true,
  });

  productForm = form(this.product, (schema) => {
    required(schema.name, { message: 'Nazwa produktu jest wymagana.' });
    minLength(schema.name, 3, { message: 'Nazwa musi mieć co najmniej 3 znaki.' });

    required(schema.description, { message: 'Opis jest wymagany.' });
    minLength(schema.description, 10, { message: 'Opis musi mieć co najmniej 10 znaków.' });

    required(schema.price, { message: 'Podaj cenę.' });
    min(schema.price, 0.01, { message: 'Cena musi być większa od 0.' });
  });

  ngOnInit() {
    const productId = this.productId();

    if (productId !== undefined) {
      const found = this.menusService.findProduct(Number(productId));

      if (!found) {
        this.notFound.set(true);
        return;
      }

      this.categoryName.set(found.categoryName);
      this.product.set({
        name: found.product.name,
        description: found.product.description,
        price: found.product.price,
        imageUrl: found.product.imageUrl,
        isAvailable: found.product.isAvailable,
      });
      return;
    }

    const category = this.category();

    if (category === undefined || !this.menusService.hasCategory(this.cuisine(), category)) {
      this.notFound.set(true);
      return;
    }

    this.categoryName.set(category);
  }

  showErrors(field: { touched(): boolean; invalid(): boolean }) {
    return (field.touched() || this.triedToSave()) && field.invalid();
  }

  save(event: Event) {
    event.preventDefault();

    if (this.productForm().invalid()) {
      this.triedToSave.set(true);
      return;
    }

    const productId = this.productId();

    if (productId === undefined) {
      this.menusService.addProduct(this.cuisine(), this.categoryName(), this.product());
    } else {
      this.menusService.updateProduct(Number(productId), this.product());
    }

    this.router.navigate(['/admin/menus', this.cuisine()]);
  }
}
