import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminMenus } from './admin-menus';
import { Menus } from '../services/menus';

describe('AdminMenus', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createPage(cuisine = 'american') {
    const fixture = TestBed.createComponent(AdminMenus);
    fixture.componentRef.setInput('cuisine', cuisine);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  function categoryTitles(page: HTMLElement) {
    return [...page.querySelectorAll('.category h2')].map((h) => h.textContent?.trim());
  }

  it('should show the categories and products of the chosen cuisine', () => {
    const { page } = createPage();
    expect(categoryTitles(page)).toEqual(['Burgery', 'Frytki', 'Napoje']);
    expect(page.textContent).toContain('Classic Burger');
    expect(page.textContent?.replace(/\s+/g, ' ')).toContain('widzi 40 restauracji');
  });

  it('should add a category and refuse an empty or duplicate name', () => {
    const { fixture, page } = createPage();
    const form = page.querySelector<HTMLFormElement>('.add-category')!;

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(page.textContent).toContain('Podaj nazwę kategorii.');

    fixture.componentInstance.newCategoryName.set('burgery');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(page.textContent).toContain('Taka kategoria już istnieje w tym menu.');

    fixture.componentInstance.newCategoryName.set('Sałatki');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(categoryTitles(page)).toEqual(['Burgery', 'Frytki', 'Napoje', 'Sałatki']);
  });

  it('should rename a category', () => {
    const { fixture, page } = createPage();

    page.querySelector<HTMLButtonElement>('.category .btn-outline-primary')!.click();
    fixture.detectChanges();
    fixture.componentInstance.renameValue.set('Burgery premium');
    page.querySelector<HTMLFormElement>('.rename-form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(categoryTitles(page)[0]).toBe('Burgery premium');
  });

  it('should delete a category only after confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { fixture, page } = createPage();
    const deleteButton = () => page.querySelector<HTMLButtonElement>('.category .btn-outline-danger')!;

    deleteButton().click();
    fixture.detectChanges();
    expect(confirmSpy).toHaveBeenCalledWith('Usunąć kategorię „Burgery” razem z produktami (4)?');
    expect(categoryTitles(page).length).toBe(3);

    confirmSpy.mockReturnValue(true);
    deleteButton().click();
    fixture.detectChanges();
    expect(categoryTitles(page)).toEqual(['Frytki', 'Napoje']);
  });

  it('should delete a product after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { fixture, page } = createPage();

    page.querySelector<HTMLButtonElement>('.category tbody .btn-outline-danger')!.click();
    fixture.detectChanges();

    expect(page.textContent).not.toContain('Classic Burger');
    expect(TestBed.inject(Menus).findProduct(101)).toBeUndefined();
  });
});
