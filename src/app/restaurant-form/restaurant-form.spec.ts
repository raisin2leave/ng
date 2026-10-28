import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RestaurantForm } from './restaurant-form';
import { Restaurants } from '../services/restaurants';

describe('RestaurantForm', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'admin', children: [] }])],
    });
  });

  it('should have all fields required by the lab', () => {
    const fixture = TestBed.createComponent(RestaurantForm);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const ids = [...page.querySelectorAll('input, textarea, select')].map((el) => el.id);
    expect(ids).toEqual([
      'name',
      'description',
      'cuisine',
      'address',
      'imageUrl',
      'deliveryTimeMin',
      'deliveryTimeMax',
      'deliveryFee',
      'minimumOrderValue',
      'isActive',
    ]);
  });

  it('should create a new restaurant from what the user typed', () => {
    const fixture = TestBed.createComponent(RestaurantForm);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    const name = page.querySelector<HTMLInputElement>('#name')!;
    name.value = 'Nowa Pizzeria';
    name.dispatchEvent(new Event('input'));

    const fee = page.querySelector<HTMLInputElement>('#deliveryFee')!;
    fee.value = '7.5';
    fee.dispatchEvent(new Event('input'));

    page.querySelector('form')!.dispatchEvent(new Event('submit'));

    const service = TestBed.inject(Restaurants);
    const all = service.getAll()();
    const created = all[all.length - 1];
    expect(all.length).toBe(201);
    expect(created.name).toBe('Nowa Pizzeria');
    expect(created.deliveryFee).toBe(7.5);
    expect(created.id).toBe(201);
    expect(created.rating).toBe(0);
  });
});
