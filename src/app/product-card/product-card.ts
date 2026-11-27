import { Component, input, output } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ImageFallback } from '../directives/image-fallback';
import { Product } from '../models/menu';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, NgOptimizedImage, ImageFallback],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();
  canOrder = input(true);

  addToCart = output<Product>();

  onAddToCartClick() {
    if (!this.product().isAvailable || !this.canOrder()) {
      return;
    }

    this.addToCart.emit(this.product());
  }
}
