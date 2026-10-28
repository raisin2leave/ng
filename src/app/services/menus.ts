import { Injectable, signal } from '@angular/core';
import { Menu, MenuCategory, Product, ProductFormValue } from '../models/menu';
import menusData from '../data/menus.json';

const STORAGE_KEY = 'foodapp-menus';

@Injectable({ providedIn: 'root' })
export class Menus {
  private menus = signal<Menu[]>(this.loadFromStorage());

  getAll() {
    return this.menus.asReadonly();
  }

  getByCuisine(cuisine: string) {
    return this.findMenuIn(this.menus(), cuisine);
  }

  hasCategory(cuisine: string, name: string) {
    const menu = this.getByCuisine(cuisine);

    if (!menu) {
      return false;
    }

    for (const category of menu.categories) {
      if (category.name.toLowerCase() === name.trim().toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  findProduct(productId: number) {
    for (const menu of this.menus()) {
      for (const category of menu.categories) {
        for (const product of category.products) {
          if (product.id === productId) {
            return { product: product, categoryName: category.name, cuisine: menu.cuisine };
          }
        }
      }
    }

    return undefined;
  }

  addCategory(cuisine: string, name: string) {
    const copy = this.copyOfMenus();
    const menu = this.findMenuIn(copy, cuisine);

    if (!menu) {
      return;
    }

    menu.categories.push({ name: name.trim(), products: [] });
    this.saveAll(copy);
  }

  renameCategory(cuisine: string, oldName: string, newName: string) {
    const copy = this.copyOfMenus();
    const category = this.findCategoryIn(copy, cuisine, oldName);

    if (!category) {
      return;
    }

    category.name = newName.trim();
    this.saveAll(copy);
  }

  deleteCategory(cuisine: string, name: string) {
    const copy = this.copyOfMenus();
    const menu = this.findMenuIn(copy, cuisine);

    if (!menu) {
      return;
    }

    const keptCategories: MenuCategory[] = [];

    for (const category of menu.categories) {
      if (category.name !== name) {
        keptCategories.push(category);
      }
    }

    menu.categories = keptCategories;
    this.saveAll(copy);
  }

  addProduct(cuisine: string, categoryName: string, data: ProductFormValue) {
    const copy = this.copyOfMenus();
    const category = this.findCategoryIn(copy, cuisine, categoryName);

    if (!category) {
      return undefined;
    }

    const newProduct: Product = { ...data, id: this.nextProductId() };
    category.products.push(newProduct);
    this.saveAll(copy);
    return newProduct;
  }

  updateProduct(productId: number, data: ProductFormValue) {
    const copy = this.copyOfMenus();

    for (const menu of copy) {
      for (const category of menu.categories) {
        for (const product of category.products) {
          if (product.id === productId) {
            product.name = data.name;
            product.description = data.description;
            product.price = data.price;
            product.imageUrl = data.imageUrl;
            product.isAvailable = data.isAvailable;
          }
        }
      }
    }

    this.saveAll(copy);
  }

  deleteProduct(productId: number) {
    const copy = this.copyOfMenus();

    for (const menu of copy) {
      for (const category of menu.categories) {
        const keptProducts: Product[] = [];

        for (const product of category.products) {
          if (product.id !== productId) {
            keptProducts.push(product);
          }
        }

        category.products = keptProducts;
      }
    }

    this.saveAll(copy);
  }

  resetToOriginal() {
    localStorage.removeItem(STORAGE_KEY);
    this.menus.set(menusData as Menu[]);
  }

  private copyOfMenus(): Menu[] {
    return structuredClone(this.menus());
  }

  private findMenuIn(menus: Menu[], cuisine: string) {
    for (const menu of menus) {
      if (menu.cuisine === cuisine) {
        return menu;
      }
    }

    return undefined;
  }

  private findCategoryIn(menus: Menu[], cuisine: string, categoryName: string) {
    const menu = this.findMenuIn(menus, cuisine);

    if (!menu) {
      return undefined;
    }

    for (const category of menu.categories) {
      if (category.name === categoryName) {
        return category;
      }
    }

    return undefined;
  }

  private nextProductId() {
    let highestId = 0;

    for (const menu of this.menus()) {
      for (const category of menu.categories) {
        for (const product of category.products) {
          if (product.id > highestId) {
            highestId = product.id;
          }
        }
      }
    }

    return highestId + 1;
  }

  private saveAll(menus: Menu[]) {
    this.menus.set(menus);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
  }

  private loadFromStorage(): Menu[] {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    return menusData as Menu[];
  }
}
