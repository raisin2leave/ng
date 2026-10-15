import { CuisineType } from './restaurant';

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

export type MenuCategory = {
  name: string;
  products: Product[];
};

export type Menu = {
  cuisine: CuisineType;
  categories: MenuCategory[];
};
