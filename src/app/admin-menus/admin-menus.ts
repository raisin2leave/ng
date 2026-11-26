import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { MenuCategory, Product } from '../models/menu';
import { Menus } from '../services/menus';
import { Restaurants } from '../services/restaurants';
import { DataState } from '../data-state/data-state';

@Component({
  selector: 'app-admin-menus',
  imports: [FormsModule, RouterLink, DataState],
  templateUrl: './admin-menus.html',
  styleUrl: './admin-menus.scss',
})
export class AdminMenus {
  private menusService = inject(Menus);
  private restaurantsService = inject(Restaurants);

  restaurantId = input.required<string>();

  restaurant = computed(() => this.restaurantsService.getById(Number(this.restaurantId())));

  menuResource = this.menusService.loadForRestaurant(() => Number(this.restaurantId()));

  menu = computed(() => (this.menuResource.hasValue() ? this.menuResource.value() : null));

  menuLoadFailed = computed(() => this.menuResource.error() !== undefined);

  saving = signal(false);
  saveError = signal('');

  newCategoryName = signal('');
  newCategoryError = signal('');

  renamingCategoryId = signal<number | undefined>(undefined);
  renameValue = signal('');
  renameError = signal('');

  checkCategoryName(name: string, currentName: string) {
    const trimmed = name.trim();

    if (trimmed === '') {
      return 'Podaj nazwę kategorii.';
    }

    if (trimmed.length < 2) {
      return 'Nazwa kategorii musi mieć co najmniej 2 znaki.';
    }

    const isSameAsBefore = trimmed.toLowerCase() === currentName.toLowerCase();

    if (!isSameAsBefore && this.hasCategory(trimmed)) {
      return 'Taka kategoria już istnieje w tym menu.';
    }

    return '';
  }

  createMenu() {
    this.send(this.menusService.createMenu(Number(this.restaurantId())), 'Nie udało się utworzyć menu.');
  }

  addCategory(event: Event) {
    event.preventDefault();

    const menu = this.menu();

    if (!menu) {
      return;
    }

    const error = this.checkCategoryName(this.newCategoryName(), '');

    if (error) {
      this.newCategoryError.set(error);
      return;
    }

    this.send(this.menusService.addCategory(menu.id, this.newCategoryName()), 'Nie udało się dodać kategorii.', () => {
      this.newCategoryName.set('');
      this.newCategoryError.set('');
    });
  }

  startRename(category: MenuCategory) {
    this.renamingCategoryId.set(category.id);
    this.renameValue.set(category.name);
    this.renameError.set('');
  }

  cancelRename() {
    this.renamingCategoryId.set(undefined);
    this.renameError.set('');
  }

  saveRename(event: Event, category: MenuCategory) {
    event.preventDefault();

    const error = this.checkCategoryName(this.renameValue(), category.name);

    if (error) {
      this.renameError.set(error);
      return;
    }

    this.send(this.menusService.renameCategory(category.id, this.renameValue()), 'Nie udało się zmienić nazwy kategorii.', () =>
      this.cancelRename(),
    );
  }

  deleteCategory(category: MenuCategory) {
    let question = `Usunąć kategorię „${category.name}”?`;

    if (category.products.length > 0) {
      question = `Usunąć kategorię „${category.name}” razem z produktami (${category.products.length})?`;
    }

    if (confirm(question)) {
      this.send(this.menusService.deleteCategory(category.id), 'Nie udało się usunąć kategorii.');
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`Usunąć produkt „${product.name}”?`)) {
      this.send(this.menusService.deleteProduct(product.id), 'Nie udało się usunąć produktu.');
    }
  }

  private hasCategory(name: string) {
    const menu = this.menu();

    if (!menu) {
      return false;
    }

    for (const category of menu.categories) {
      if (category.name.toLowerCase() === name.toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  private send(request: Observable<unknown>, errorMessage: string, afterSuccess?: () => void) {
    this.saving.set(true);
    this.saveError.set('');

    request.subscribe({
      next: () => {
        this.saving.set(false);
        afterSuccess?.();
        this.menuResource.reload();
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set(`${errorMessage} Sprawdź połączenie i spróbuj ponownie.`);
      },
    });
  }
}
