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
});
