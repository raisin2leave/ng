import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { cuisineOptions } from '../models/restaurant';
import { MenuCategory, Product } from '../models/menu';
import { Menus } from '../services/menus';
import { Restaurants } from '../services/restaurants';

@Component({
  selector: 'app-admin-menus',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-menus.html',
  styleUrl: './admin-menus.scss',
})
export class AdminMenus {
  private menusService = inject(Menus);
  private restaurantsService = inject(Restaurants);

  cuisine = input.required<string>();

  cuisineOptions = cuisineOptions;

  menu = computed(() => this.menusService.getByCuisine(this.cuisine()));

  restaurantCount = computed(() => {
    let count = 0;

    for (const restaurant of this.restaurantsService.getAll()()) {
      if (restaurant.cuisine === this.cuisine()) {
        count = count + 1;
      }
    }

    return count;
  });

  newCategoryName = signal('');
  newCategoryError = signal('');

  renamingCategory = signal('');
  renameValue = signal('');
  renameError = signal('');

  cuisineLabel(cuisine: string) {
    for (const option of cuisineOptions) {
      if (option.value === cuisine) {
        return option.label;
      }
    }

    return cuisine;
  }

  checkCategoryName(name: string, currentName: string) {
    const trimmed = name.trim();

    if (trimmed === '') {
      return 'Podaj nazwę kategorii.';
    }

    if (trimmed.length < 2) {
      return 'Nazwa kategorii musi mieć co najmniej 2 znaki.';
    }

    const isSameAsBefore = trimmed.toLowerCase() === currentName.toLowerCase();

    if (!isSameAsBefore && this.menusService.hasCategory(this.cuisine(), trimmed)) {
      return 'Taka kategoria już istnieje w tym menu.';
    }

    return '';
  }

  addCategory(event: Event) {
    event.preventDefault();

    const error = this.checkCategoryName(this.newCategoryName(), '');

    if (error) {
      this.newCategoryError.set(error);
      return;
    }

    this.menusService.addCategory(this.cuisine(), this.newCategoryName());
    this.newCategoryName.set('');
    this.newCategoryError.set('');
  }

  startRename(category: MenuCategory) {
    this.renamingCategory.set(category.name);
    this.renameValue.set(category.name);
    this.renameError.set('');
  }

  cancelRename() {
    this.renamingCategory.set('');
    this.renameError.set('');
  }

  saveRename(event: Event) {
    event.preventDefault();

    const oldName = this.renamingCategory();
    const error = this.checkCategoryName(this.renameValue(), oldName);

    if (error) {
      this.renameError.set(error);
      return;
    }

    this.menusService.renameCategory(this.cuisine(), oldName, this.renameValue());
    this.cancelRename();
  }

  deleteCategory(category: MenuCategory) {
    let question = `Usunąć kategorię „${category.name}”?`;

    if (category.products.length > 0) {
      question = `Usunąć kategorię „${category.name}” razem z produktami (${category.products.length})?`;
    }

    if (confirm(question)) {
      this.menusService.deleteCategory(this.cuisine(), category.name);
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`Usunąć produkt „${product.name}”?`)) {
      this.menusService.deleteProduct(product.id);
    }
  }

  resetMenus() {
    if (confirm('Usunąć wszystkie zmiany w menu i przywrócić oryginalne dane?')) {
      this.menusService.resetToOriginal();
    }
  }
}
