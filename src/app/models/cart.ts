import { Product } from './menu';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type AddToCartResult = 'added' | 'other-restaurant';
