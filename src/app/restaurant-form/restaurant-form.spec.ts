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

  it('should open an existing restaurant pre-filled and save the changes', () => {
    const fixture = TestBed.createComponent(RestaurantForm);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.querySelector('h1')?.textContent).toContain('Edytuj restaurację');
    const name = page.querySelector<HTMLInputElement>('#name')!;
    expect(name.value).toBe('Pierogarnia Pod Aniołami');

    name.value = 'Pierogarnia Zmieniona';
    name.dispatchEvent(new Event('input'));
    page.querySelector('form')!.dispatchEvent(new Event('submit'));

    const service = TestBed.inject(Restaurants);
    const edited = service.getById(1)!;
    expect(service.getAll()().length).toBe(200);
    expect(edited.name).toBe('Pierogarnia Zmieniona');
    expect(edited.rating).toBe(5.8);
    expect(edited.cuisine).toBe('polish');
  });

  it('should show a message for an unknown restaurant', () => {
    const fixture = TestBed.createComponent(RestaurantForm);
    fixture.componentRef.setInput('id', '9999');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Nie znaleziono restauracji.');
    expect(page.querySelector('form')).toBeNull();
  });
});
