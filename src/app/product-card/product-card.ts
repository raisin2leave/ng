import { Component, input, output } from '@angular/core';
import { Product } from '../models/menu';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();

  addToCart = output<Product>();

  onAddToCartClick() {
    if (!this.product().isAvailable) {
      return;
    }

    this.addToCart.emit(this.product());
  }
}
