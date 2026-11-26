export type Product = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

export type ProductFormValue = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

export type Category = {
  id: number;
  menuId: number;
  name: string;
};

export type MenuCategory = Category & {
  products: Product[];
};

export type MenuInfo = {
  id: number;
  restaurantId: number;
  name: string;
};

export type Menu = MenuInfo & {
  categories: MenuCategory[];
};
