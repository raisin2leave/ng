import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminMenus } from './admin-menus';
import { API_URL } from '../api';
import {
  answerMenu,
  answerRestaurantList,
  categoriesOfRestaurant,
  fakeServer,
  productsOfCategory,
  provideTestApi,
  settle,
} from '../testing/api-test';

describe('AdminMenus (menu of one restaurant from the API)', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideTestApi()] });
    await answerRestaurantList();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createPage(restaurantId = 3) {
    const fixture = TestBed.createComponent(AdminMenus);
    fixture.componentRef.setInput('restaurantId', String(restaurantId));
    fixture.detectChanges();
    await answerMenu(restaurantId);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  async function answerMenuAgain(fixture: { detectChanges(): void }, restaurantId = 3) {
    await answerMenu(restaurantId);
    fixture.detectChanges();
  }

  function categoryTitles(page: HTMLElement) {
    return [...page.querySelectorAll('.category h2')].map((h) => h.textContent?.trim());
  }

  it('should show the restaurant name and the categories and products of its menu', async () => {
    const { page } = await createPage();
    expect(page.querySelector('h1')?.textContent).toContain('Smash Burger Co.');
    expect(categoryTitles(page)).toEqual(['Burgery', 'Frytki', 'Napoje']);
    expect(page.textContent).toContain('Classic Burger');
  });

  it('should add a category with POST /categories and refuse an empty or duplicate name', async () => {
    const { fixture, page } = await createPage();
    const form = page.querySelector<HTMLFormElement>('.add-category')!;

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(page.textContent).toContain('Podaj nazwę kategorii.');

    fixture.componentInstance.newCategoryName.set('burgery');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(page.textContent).toContain('Taka kategoria już istnieje w tym menu.');
    fakeServer().expectNone(`${API_URL}/categories`);

    fixture.componentInstance.newCategoryName.set('Sałatki');
    form.dispatchEvent(new Event('submit'));
    const request = fakeServer().expectOne(`${API_URL}/categories`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ menuId: 3, name: 'Sałatki' });
    request.flush({ id: 681, menuId: 3, name: 'Sałatki' });

    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/restaurants/3/menus`).flush([{ id: 3, restaurantId: 3, name: 'Menu' }]);
    fakeServer()
      .expectOne(`${API_URL}/menus/3/categories`)
      .flush([...categoriesOfRestaurant(3), { id: 681, menuId: 3, name: 'Sałatki' }]);
    for (const category of categoriesOfRestaurant(3)) {
      fakeServer().expectOne(`${API_URL}/categories/${category.id}/products`).flush(productsOfCategory(category.id));
    }
    fakeServer().expectOne(`${API_URL}/categories/681/products`).flush([]);
    await settle();
    fixture.detectChanges();

    expect(categoryTitles(page)).toEqual(['Burgery', 'Frytki', 'Napoje', 'Sałatki']);
    expect(fixture.componentInstance.newCategoryName()).toBe('');
  });

  it('should rename a category with PATCH /categories/:id', async () => {
    const { fixture, page } = await createPage();

    page.querySelector<HTMLButtonElement>('.category .btn-outline-primary')!.click();
    fixture.detectChanges();
    fixture.componentInstance.renameValue.set('Burgery premium');
    page.querySelector<HTMLFormElement>('.rename-form')!.dispatchEvent(new Event('submit'));

    const request = fakeServer().expectOne(`${API_URL}/categories/8`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ name: 'Burgery premium' });
    request.flush({ id: 8, menuId: 3, name: 'Burgery premium' });
    await answerMenuAgain(fixture);

    expect(page.querySelector('.rename-form')).toBeNull();
  });

  it('should delete a category only after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { fixture, page } = await createPage();
    const deleteButton = () => page.querySelector<HTMLButtonElement>('.category .btn-outline-danger')!;

    deleteButton().click();
    expect(confirmSpy).toHaveBeenCalledWith('Usunąć kategorię „Burgery” razem z produktami (4)?');
    fakeServer().expectNone(`${API_URL}/categories/8`);

    confirmSpy.mockReturnValue(true);
    deleteButton().click();
    const request = fakeServer().expectOne(`${API_URL}/categories/8`);
    expect(request.request.method).toBe('DELETE');
    request.flush({});
    await answerMenuAgain(fixture);
  });

  it('should delete a product with DELETE /products/:id after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { fixture, page } = await createPage();

    page.querySelector<HTMLButtonElement>('.category tbody .btn-outline-danger')!.click();
    const request = fakeServer().expectOne(`${API_URL}/products/17`);
    expect(request.request.method).toBe('DELETE');
    request.flush({});
    await answerMenuAgain(fixture);
  });

  it('should show a message when saving fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { fixture, page } = await createPage();

    page.querySelector<HTMLButtonElement>('.category tbody .btn-outline-danger')!.click();
    fakeServer().expectOne(`${API_URL}/products/17`).flush('down', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(page.querySelector('.alert-danger')?.textContent).toContain('Nie udało się usunąć produktu.');
    expect(page.textContent).toContain('Classic Burger');
  });

  it('Empty: should offer to create a menu for a restaurant without one', async () => {
    const fixture = TestBed.createComponent(AdminMenus);
    fixture.componentRef.setInput('restaurantId', '201');
    fixture.detectChanges();
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/restaurants/201/menus`).flush([]);
    await settle();
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.textContent).toContain('Ta restauracja nie ma jeszcze menu.');
    [...page.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.includes('Utwórz menu'))!.click();

    const request = fakeServer().expectOne(`${API_URL}/menus`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ restaurantId: 201, name: 'Menu' });
  });

  it('Error: should show "Unable to load data." with Retry', async () => {
    const fixture = TestBed.createComponent(AdminMenus);
    fixture.componentRef.setInput('restaurantId', '3');
    fixture.detectChanges();
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/restaurants/3/menus`).flush('down', { status: 500, statusText: 'Server Error' });
    await settle();
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.textContent).toContain('Unable to load data.');
    page.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    await answerMenuAgain(fixture);

    expect(categoryTitles(page)).toEqual(['Burgery', 'Frytki', 'Napoje']);
  });
});
