import { TestBed } from '@angular/core/testing';
import { ProductCard } from './product-card';
import { Product } from '../models/menu';

const testProduct: Product = {
  id: 1,
  name: 'Test Burger',
  description: 'Test description',
  price: 32,
  imageUrl: 'https://example.com/burger.jpg',
  isAvailable: true,
};

describe('ProductCard', () => {
  it('should show name, description, price and availability', () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', testProduct);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Test Burger');
    expect(page.textContent).toContain('Test description');
    expect(page.textContent).toContain('32.00 zł');
    expect(page.textContent).toContain('Dostępny');
    expect(page.querySelector('img')?.getAttribute('alt')).toBe('Test Burger');
  });

  it('should say when a product is not available', () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', { ...testProduct, isAvailable: false });
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Niedostępny');
  });

  it('should send the product to the parent when "Dodaj do koszyka" is clicked', () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', testProduct);
    fixture.detectChanges();

    const added: Product[] = [];
    fixture.componentInstance.addToCart.subscribe((product) => added.push(product));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(false);
    button.click();
    expect(added).toEqual([testProduct]);
  });

  it('should mark an unavailable product and block adding it to the cart', () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', { ...testProduct, isAvailable: false });
    fixture.detectChanges();

    const added: Product[] = [];
    fixture.componentInstance.addToCart.subscribe((product) => added.push(product));

    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.unavailable-card')).not.toBeNull();

    const button: HTMLButtonElement = page.querySelector('button')!;
    expect(button.disabled).toBe(true);
    fixture.componentInstance.onAddToCartClick();
    expect(added).toEqual([]);
  });
});
