import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ProductForm } from './product-form';
import { API_URL } from '../api';
import { fakeServer, provideTestApi, categoryFromSeed, seedProducts, settle } from '../testing/api-test';

describe('ProductForm (products saved in the API)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'admin/menus/:restaurantId', children: [] }]), ...provideTestApi()],
    });
  });

  function typeInto(page: HTMLElement, selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  async function openNewProduct(categoryId = 9) {
    const fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('restaurantId', '3');
    fixture.componentRef.setInput('categoryId', String(categoryId));
    fixture.detectChanges();
    TestBed.tick();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  it('should load the category and add a new product with POST /products', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { fixture, page } = await openNewProduct();
    expect(page.textContent).toContain('Ładowanie produktu…');

    fakeServer().expectOne(`${API_URL}/categories/9`).flush(categoryFromSeed(9));
    await settle();
    fixture.detectChanges();

    expect(page.querySelector('h1')?.textContent).toContain('Nowy produkt');
    expect(page.textContent).toContain('Kategoria: Frytki');

    typeInto(page, '#product-name', 'Frytki z batatów');
    typeInto(page, '#product-description', 'Chrupiące frytki ze słodkich ziemniaków.');
    typeInto(page, '#product-price', '13.5');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));

    const request = fakeServer().expectOne(`${API_URL}/products`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Frytki z batatów',
      description: 'Chrupiące frytki ze słodkich ziemniaków.',
      price: 13.5,
      imageUrl: '',
      isAvailable: true,
      categoryId: 9,
    });
    request.flush({ ...request.request.body, id: 1681 });

    expect(navigate).toHaveBeenCalledWith(['/admin/menus', '3']);
  });

  it('should load an existing product pre-filled and save changes with PATCH /products/:id', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('restaurantId', '3');
    fixture.componentRef.setInput('productId', '20');
    fixture.detectChanges();
    TestBed.tick();

    fakeServer().expectOne(`${API_URL}/products/20`).flush(seedProducts.find((p) => p.id === 20)!);
    await settle();
    fakeServer().expectOne(`${API_URL}/categories/8`).flush(categoryFromSeed(8));
    await settle();
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.querySelector('h1')?.textContent).toContain('Edytuj produkt');
    expect(page.textContent).toContain('Kategoria: Burgery');
    expect(page.querySelector<HTMLInputElement>('#product-name')!.value).toBe('Double Smash Burger');
    expect(page.querySelector<HTMLInputElement>('#product-available')!.checked).toBe(false);

    page.querySelector<HTMLInputElement>('#product-available')!.click();
    page.querySelector('form')!.dispatchEvent(new Event('submit'));

    const request = fakeServer().expectOne(`${API_URL}/products/20`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.isAvailable).toBe(true);
    request.flush({ ...seedProducts.find((p) => p.id === 20)!, isAvailable: true });

    expect(navigate).toHaveBeenCalledWith(['/admin/menus', '3']);
  });

  it('should not send invalid data', async () => {
    const { fixture, page } = await openNewProduct();
    fakeServer().expectOne(`${API_URL}/categories/9`).flush(categoryFromSeed(9));
    await settle();
    fixture.detectChanges();

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
    fakeServer().expectNone(`${API_URL}/products`);
  });

  it('should keep the form and show a message when saving fails', async () => {
    const { fixture, page } = await openNewProduct();
    fakeServer().expectOne(`${API_URL}/categories/9`).flush(categoryFromSeed(9));
    await settle();
    fixture.detectChanges();

    typeInto(page, '#product-name', 'Frytki z batatów');
    typeInto(page, '#product-description', 'Chrupiące frytki ze słodkich ziemniaków.');
    typeInto(page, '#product-price', '13.5');
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fakeServer().expectOne(`${API_URL}/products`).flush('down', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(page.querySelector('.alert-danger')?.textContent).toContain('Nie udało się zapisać produktu.');
    expect(page.querySelector<HTMLInputElement>('#product-name')!.value).toBe('Frytki z batatów');
  });

  it('should say "not found" when the category does not exist (404)', async () => {
    const { fixture, page } = await openNewProduct(9999);
    fakeServer().expectOne(`${API_URL}/categories/9999`).flush('Not found', { status: 404, statusText: 'Not Found' });
    await settle();
    fixture.detectChanges();

    expect(page.textContent).toContain('Nie znaleziono produktu ani kategorii.');
    expect(page.querySelector('form')).toBeNull();
  });

  it('should show "Unable to load data." with Retry on a server error', async () => {
    const { fixture, page } = await openNewProduct();
    fakeServer().expectOne(`${API_URL}/categories/9`).flush('down', { status: 500, statusText: 'Server Error' });
    await settle();
    fixture.detectChanges();

    expect(page.textContent).toContain('Unable to load data.');
    page.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/categories/9`).flush(categoryFromSeed(9));
    await settle();
    fixture.detectChanges();

    expect(page.querySelector('form')).not.toBeNull();
  });
});
