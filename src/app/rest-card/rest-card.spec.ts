import { TestBed } from '@angular/core/testing';
import { RestCard } from './rest-card';
import { CuisineType, Restaurant } from '../models/restaurant';

// A fake restaurant, only for the test
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
    fixture.componentRef.setInput('restaurant', testRestaurant); // like [restaurant]="..." in HTML
    fixture.detectChanges(); // draw the HTML
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Test Pizza');
  });
});
