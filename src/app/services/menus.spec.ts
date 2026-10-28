import { TestBed } from '@angular/core/testing';
import { Menus } from './menus';

const newProduct = {
  name: 'Sałatka Cezar',
  description: 'Sałata rzymska, kurczak, grzanki i parmezan.',
  price: 24.5,
  imageUrl: '',
  isAvailable: true,
};

describe('Menus service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should load the 5 menus from the JSON file', () => {
    const service = TestBed.inject(Menus);
    expect(service.getAll()().length).toBe(5);
    expect(service.getByCuisine('american')?.categories.length).toBe(3);
  });

  it('should add, rename and delete a category', () => {
    const service = TestBed.inject(Menus);

    service.addCategory('american', '  Sałatki  ');
    expect(service.hasCategory('american', 'sałatki')).toBe(true);
    expect(service.getByCuisine('american')!.categories.length).toBe(4);

    service.renameCategory('american', 'Sałatki', 'Zdrowe');
    expect(service.hasCategory('american', 'Sałatki')).toBe(false);
    expect(service.hasCategory('american', 'Zdrowe')).toBe(true);

    service.deleteCategory('american', 'Zdrowe');
    expect(service.getByCuisine('american')!.categories.length).toBe(3);
  });

  it('should add, edit and delete a product with a new unique id', () => {
    const service = TestBed.inject(Menus);

    const created = service.addProduct('american', 'Burgery', newProduct)!;
    expect(created.id).toBe(533);
    expect(service.findProduct(533)?.categoryName).toBe('Burgery');

    service.updateProduct(533, { ...newProduct, price: 19.99, isAvailable: false });
    expect(service.findProduct(533)?.product.price).toBe(19.99);
    expect(service.findProduct(533)?.product.isAvailable).toBe(false);

    service.deleteProduct(533);
    expect(service.findProduct(533)).toBeUndefined();
  });

  it('should save changes to localStorage, not change the original data, and reset', () => {
    const service = TestBed.inject(Menus);
    const before = service.getAll()();

    service.deleteProduct(101);

    expect(service.findProduct(101)).toBeUndefined();
    expect(before[0].categories[0].products[0].id).toBe(101);
    expect(localStorage.getItem('foodapp-menus')).toContain('"id":102');
    expect(localStorage.getItem('foodapp-menus')).not.toContain('"id":101,');

    service.resetToOriginal();
    expect(service.findProduct(101)).toBeDefined();
    expect(localStorage.getItem('foodapp-menus')).toBeNull();
  });
});
