import { TestBed } from '@angular/core/testing';
import { Restaurants } from './restaurants';

describe('Restaurants service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should load all 200 restaurants from the JSON file', () => {
    const service = TestBed.inject(Restaurants);
    expect(service.getAll()().length).toBe(200);
  });

  it('should find a restaurant by id', () => {
    const service = TestBed.inject(Restaurants);
    expect(service.getById(1)?.name).toBe('Pierogarnia Pod Aniołami');
    expect(service.getById(9999)).toBeUndefined();
  });

  it('should create a restaurant, save it to localStorage and reset back', () => {
    const service = TestBed.inject(Restaurants);
    const created = service.create({
      name: 'Testowa',
      description: 'Opis testowej restauracji',
      address: 'ul. Testowa 1, 00-001 Warszawa',
      cuisine: service.getById(1)!.cuisine,
      imageUrl: '',
      deliveryTimeMin: 10,
      deliveryTimeMax: 20,
      deliveryFee: 5,
      minimumOrderValue: 30,
      isActive: true,
    });

    expect(created.id).toBe(201);
    expect(service.getAll()().length).toBe(201);

    const saved = JSON.parse(localStorage.getItem('foodapp-restaurants')!);
    expect(saved.length).toBe(201);

    service.resetToOriginal();
    expect(service.getAll()().length).toBe(200);
    expect(localStorage.getItem('foodapp-restaurants')).toBeNull();
  });

  it('should update only the chosen restaurant and keep its id and rating', () => {
    const service = TestBed.inject(Restaurants);
    const before = service.getById(2)!;

    service.update(2, {
      name: 'Nowa nazwa',
      description: before.description,
      address: before.address,
      cuisine: before.cuisine,
      imageUrl: before.imageUrl ?? '',
      deliveryTimeMin: before.deliveryTimeMin,
      deliveryTimeMax: before.deliveryTimeMax,
      deliveryFee: 1,
      minimumOrderValue: before.minimumOrderValue,
      isActive: before.isActive,
    });

    const after = service.getById(2)!;
    expect(after.name).toBe('Nowa nazwa');
    expect(after.deliveryFee).toBe(1);
    expect(after.id).toBe(2);
    expect(after.rating).toBe(before.rating);
    expect(service.getById(1)!.name).toBe('Pierogarnia Pod Aniołami');
    expect(service.getAll()().length).toBe(200);
  });

  it('should deactivate a restaurant, keep all its data, and save it', () => {
    const service = TestBed.inject(Restaurants);
    const before = service.getById(3)!;

    service.setActive(3, false);

    const after = service.getById(3)!;
    expect(after.isActive).toBe(false);
    expect({ ...after, isActive: true }).toEqual({ ...before, isActive: true });
    expect(service.getAll()().length).toBe(200);

    const saved = JSON.parse(localStorage.getItem('foodapp-restaurants')!);
    expect(saved.find((r: { id: number }) => r.id === 3).isActive).toBe(false);
  });
});
