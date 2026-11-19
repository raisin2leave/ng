import { TestBed } from '@angular/core/testing';
import { Restaurants } from './restaurants';
import { API_URL } from '../api';
import { RestaurantFormValue } from '../models/restaurant';
import {
  answerRestaurantList,
  failRestaurantList,
  fakeServer,
  provideTestApi,
  seedRestaurants,
  settle,
} from '../testing/api-test';

function formValueOf(id: number): RestaurantFormValue {
  const restaurant = seedRestaurants.find((r) => r.id === id)!;
  return {
    name: restaurant.name,
    description: restaurant.description,
    address: restaurant.address,
    cuisine: restaurant.cuisine,
    imageUrl: restaurant.imageUrl ?? '',
    deliveryTimeMin: restaurant.deliveryTimeMin,
    deliveryTimeMax: restaurant.deliveryTimeMax,
    deliveryFee: restaurant.deliveryFee,
    minimumOrderValue: restaurant.minimumOrderValue,
    isActive: restaurant.isActive,
  };
}

describe('Restaurants service (API)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideTestApi() });
  });

  afterEach(() => {
    fakeServer().verify();
  });

  it('should be loading until the API answers, then hold all restaurants (FR-01)', async () => {
    const service = TestBed.inject(Restaurants);
    TestBed.tick();

    expect(service.isLoading()).toBe(true);
    expect(service.hasLoaded()).toBe(false);

    fakeServer().expectOne(`${API_URL}/restaurants`).flush(seedRestaurants);
    await settle();

    expect(service.isLoading()).toBe(false);
    expect(service.hasLoaded()).toBe(true);
    expect(service.getAll()().length).toBe(200);
    expect(service.getById(1)?.name).toBe('Pierogarnia Pod Aniołami');
    expect(service.getById(9999)).toBeUndefined();
  });

  it('should report an error, and load again after reload (Retry)', async () => {
    const service = TestBed.inject(Restaurants);
    await failRestaurantList();

    expect(service.loadFailed()).toBe(true);
    expect(service.getAll()()).toEqual([]);

    service.reload();
    TestBed.tick();
    fakeServer().expectOne(`${API_URL}/restaurants`).flush(seedRestaurants);
    await settle();

    expect(service.loadFailed()).toBe(false);
    expect(service.getAll()().length).toBe(200);
  });

  it('should POST a new restaurant with rating 0 and add the answer to the list', async () => {
    const service = TestBed.inject(Restaurants);
    await answerRestaurantList();

    let created: unknown;
    service.create({ ...formValueOf(1), name: 'Testowa' }).subscribe((answer) => (created = answer));

    const request = fakeServer().expectOne(`${API_URL}/restaurants`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.name).toBe('Testowa');
    expect(request.request.body.rating).toBe(0);
    request.flush({ ...request.request.body, id: 201 });

    expect(created).toEqual(expect.objectContaining({ id: 201, name: 'Testowa' }));
    expect(service.getAll()().length).toBe(201);
    expect(service.getById(201)?.name).toBe('Testowa');
  });

  it('should PATCH an edited restaurant and replace it in the list', async () => {
    const service = TestBed.inject(Restaurants);
    await answerRestaurantList();

    service.update(2, { ...formValueOf(2), name: 'Nowa nazwa' }).subscribe();

    const request = fakeServer().expectOne(`${API_URL}/restaurants/2`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ ...seedRestaurants[1], name: 'Nowa nazwa' });

    expect(service.getById(2)?.name).toBe('Nowa nazwa');
    expect(service.getById(2)?.rating).toBe(seedRestaurants[1].rating);
    expect(service.getAll()().length).toBe(200);
  });

  it('should PATCH only isActive when deactivating', async () => {
    const service = TestBed.inject(Restaurants);
    await answerRestaurantList();

    service.setActive(3, false).subscribe();

    const request = fakeServer().expectOne(`${API_URL}/restaurants/3`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ isActive: false });
    request.flush({ ...seedRestaurants[2], isActive: false });

    expect(service.getById(3)?.isActive).toBe(false);
  });

  it('should leave the list unchanged when saving fails', async () => {
    const service = TestBed.inject(Restaurants);
    await answerRestaurantList();

    let failed = false;
    service.setActive(3, false).subscribe({ error: () => (failed = true) });
    fakeServer().expectOne(`${API_URL}/restaurants/3`).flush('down', { status: 503, statusText: 'Unavailable' });

    expect(failed).toBe(true);
    expect(service.getById(3)?.isActive).toBe(true);
  });
});
