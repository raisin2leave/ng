import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductForm } from './product-form';
import { Menus } from '../services/menus';

describe('ProductForm', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'admin/menus/:cuisine', children: [] }])],
    });
  });

  function typeInto(page: HTMLElement, selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  it('should add a new product to the chosen category', () => {
    const fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('cuisine', 'american');
    fixture.componentRef.setInput('category', 'Frytki');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.querySelector('h1')?.textContent).toContain('Nowy produkt');
    expect(page.textContent).toContain('Kategoria: Frytki');

    typeInto(page, '#product-name', 'Frytki z batatów');
    typeInto(page, '#product-description', 'Chrupiące frytki ze słodkich ziemniaków.');
    typeInto(page, '#product-price', '13.5');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));

    const found = TestBed.inject(Menus).findProduct(533);
    expect(found?.product.name).toBe('Frytki z batatów');
    expect(found?.product.price).toBe(13.5);
    expect(found?.categoryName).toBe('Frytki');
  });

  it('should open an existing product pre-filled and save changes', () => {
    const fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('cuisine', 'american');
    fixture.componentRef.setInput('productId', '104');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.querySelector('h1')?.textContent).toContain('Edytuj produkt');
    expect(page.querySelector<HTMLInputElement>('#product-name')!.value).toBe('Double Smash Burger');
    expect(page.querySelector<HTMLInputElement>('#product-available')!.checked).toBe(false);

    const available = page.querySelector<HTMLInputElement>('#product-available')!;
    available.click();
    page.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(TestBed.inject(Menus).findProduct(104)?.product.isAvailable).toBe(true);
  });

  it('should not save invalid data', () => {
    const fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('cuisine', 'american');
    fixture.componentRef.setInput('category', 'Frytki');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    typeInto(page, '#product-name', 'AB');
    typeInto(page, '#product-price', '0');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = [...page.querySelectorAll('.invalid-feedback')].map((e) => e.textContent?.trim());
    expect(errors).toEqual([
      'Nazwa musi mieć co najmniej 3 znaki.',
      'Cena musi być większa od 0.',
      'Opis jest wymagany.',
    ]);
    expect(TestBed.inject(Menus).getByCuisine('american')!.categories[1].products.length).toBe(3);
  });

  it('should show a message for an unknown category', () => {
    const fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('cuisine', 'american');
    fixture.componentRef.setInput('category', 'Nie istnieje');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Nie znaleziono produktu ani kategorii.');
    expect(page.querySelector('form')).toBeNull();
  });
});
