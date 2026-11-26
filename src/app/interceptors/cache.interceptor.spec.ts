import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CACHE_MAX_AGE_MS, cacheInterceptor } from './cache.interceptor';
import { API_URL } from '../api';
import { fakeServer } from '../testing/api-test';

describe('cacheInterceptor (bonus: data cache)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([cacheInterceptor])), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function get(address: string) {
    let answer: unknown;
    TestBed.inject(HttpClient)
      .get(`${API_URL}${address}`)
      .subscribe({ next: (data) => (answer = data), error: () => (answer = 'error') });
    return () => answer;
  }

  it('should answer the same GET from the cache, without asking the server again', () => {
    get('/restaurants/3');
    fakeServer().expectOne(`${API_URL}/restaurants/3`).flush({ id: 3, name: 'Smash Burger Co.' });

    const second = get('/restaurants/3');
    fakeServer().expectNone(`${API_URL}/restaurants/3`);
    expect(second()).toEqual({ id: 3, name: 'Smash Burger Co.' });
  });

  it('should forget everything after a change (POST, PATCH, DELETE), so changes are visible at once', () => {
    get('/menus/3/categories');
    fakeServer().expectOne(`${API_URL}/menus/3/categories`).flush([]);

    TestBed.inject(HttpClient).post(`${API_URL}/categories`, { menuId: 3, name: 'Sałatki' }).subscribe();
    fakeServer().expectOne(`${API_URL}/categories`).flush({ id: 681 });

    get('/menus/3/categories');
    fakeServer().expectOne(`${API_URL}/menus/3/categories`);
  });

  it('should ask the server again when the saved answer is too old', () => {
    vi.useFakeTimers();
    get('/restaurants');
    fakeServer().expectOne(`${API_URL}/restaurants`).flush([]);

    vi.advanceTimersByTime(CACHE_MAX_AGE_MS + 1);
    get('/restaurants');
    fakeServer().expectOne(`${API_URL}/restaurants`);
  });

  it('should not cache orders, because their status can change at any time', () => {
    get('/orders');
    fakeServer().expectOne(`${API_URL}/orders`).flush([]);

    get('/orders');
    fakeServer().expectOne(`${API_URL}/orders`);
  });

  it('should not cache failed answers, so Retry really asks the server again', () => {
    get('/restaurants');
    fakeServer().expectOne(`${API_URL}/restaurants`).flush('down', { status: 500, statusText: 'Server Error' });

    get('/restaurants');
    fakeServer().expectOne(`${API_URL}/restaurants`);
  });
});
