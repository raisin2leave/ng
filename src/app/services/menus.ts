import { inject, Injectable } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Category, Menu, MenuCategory, MenuInfo, Product, ProductFormValue } from '../models/menu';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class Menus {
  private http = inject(HttpClient);

  loadForRestaurant(restaurantId: () => number) {
    return rxResource({
      params: () => restaurantId(),
      stream: ({ params }) => this.fetchMenu(params),
    });
  }

  loadProduct(productId: () => number | undefined) {
    return httpResource<Product>(() => {
      const id = productId();
      return id === undefined ? undefined : `${API_URL}/products/${id}`;
    });
  }

  loadCategory(categoryId: () => number | undefined) {
    return httpResource<Category>(() => {
      const id = categoryId();
      return id === undefined ? undefined : `${API_URL}/categories/${id}`;
    });
  }

  createMenu(restaurantId: number) {
    return this.http.post<MenuInfo>(`${API_URL}/menus`, { restaurantId: restaurantId, name: 'Menu' });
  }

  addCategory(menuId: number, name: string) {
    return this.http.post<Category>(`${API_URL}/categories`, { menuId: menuId, name: name.trim() });
  }

  renameCategory(categoryId: number, name: string) {
    return this.http.patch<Category>(`${API_URL}/categories/${categoryId}`, { name: name.trim() });
  }

  deleteCategory(categoryId: number) {
    return this.http.delete(`${API_URL}/categories/${categoryId}`);
  }

  addProduct(categoryId: number, data: ProductFormValue) {
    return this.http.post<Product>(`${API_URL}/products`, { ...data, categoryId: categoryId });
  }

  updateProduct(productId: number, data: ProductFormValue) {
    return this.http.patch<Product>(`${API_URL}/products/${productId}`, data);
  }

  deleteProduct(productId: number) {
    return this.http.delete(`${API_URL}/products/${productId}`);
  }

  private fetchMenu(restaurantId: number): Observable<Menu | null> {
    return this.http.get<MenuInfo[]>(`${API_URL}/restaurants/${restaurantId}/menus`).pipe(
      switchMap((menus) => {
        if (menus.length === 0) {
          return of(null);
        }

        return this.fetchCategories(menus[0]);
      }),
    );
  }

  private fetchCategories(menu: MenuInfo): Observable<Menu> {
    return this.http.get<Category[]>(`${API_URL}/menus/${menu.id}/categories`).pipe(
      switchMap((categories) => {
        if (categories.length === 0) {
          return of({ ...menu, categories: [] });
        }

        const productRequests: Observable<MenuCategory>[] = [];

        for (const category of categories) {
          productRequests.push(this.fetchProducts(category));
        }

        return forkJoin(productRequests).pipe(map((withProducts) => ({ ...menu, categories: withProducts })));
      }),
    );
  }

  private fetchProducts(category: Category): Observable<MenuCategory> {
    return this.http
      .get<Product[]>(`${API_URL}/categories/${category.id}/products`)
      .pipe(map((products) => ({ ...category, products: products })));
  }
}
