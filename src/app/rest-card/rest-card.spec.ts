import { TestBed } from '@angular/core/testing';
import { RestCard } from './rest-card';
import { CuisineType, Restaurant } from '../models/restaurant';

const testRestaurant: Restaurant = {
  id: 1,
  name: 'Test Pizza',
  description: 'Test description',
  cuisine: CuisineType.Italian,
  rating: 4.5,
  deliveryTimeMin: 20,
  deliveryTimeMax: 30,
  deliveryFee: 5,
  minimumOrderValue: 25,
  isActive: true,
};

describe('RestCard', () => {
  it('should show the restaurant name', () => {
    const fixture = TestBed.createComponent(RestCard);
    fixture.componentRef.setInput('restaurant', testRestaurant);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Test Pizza');
  });
});
