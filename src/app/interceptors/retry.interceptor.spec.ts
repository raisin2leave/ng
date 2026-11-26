import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RETRY_DELAY_MS, retryInterceptor } from './retry.interceptor';
import { fakeServer } from '../testing/api-test';

describe('retryInterceptor (bonus: automatic retry)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([retryInterceptor])), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should try a GET again after a server error, and succeed', () => {
    let answer: unknown;
    TestBed.inject(HttpClient).get('/restaurants').subscribe((data) => (answer = data));

    fakeServer().expectOne('/restaurants').flush('down', { status: 503, statusText: 'Unavailable' });
    fakeServer().expectNone('/restaurants');

    vi.advanceTimersByTime(RETRY_DELAY_MS);
    fakeServer().expectOne('/restaurants').flush([{ id: 1 }]);

    expect(answer).toEqual([{ id: 1 }]);
  });

  it('should give up after 2 extra tries and pass the error on', () => {
    let failed = false;
    TestBed.inject(HttpClient)
      .get('/restaurants')
      .subscribe({ error: () => (failed = true) });

    fakeServer().expectOne('/restaurants').flush('down', { status: 500, statusText: 'Server Error' });
    vi.advanceTimersByTime(RETRY_DELAY_MS);
    fakeServer().expectOne('/restaurants').flush('down', { status: 500, statusText: 'Server Error' });
    vi.advanceTimersByTime(RETRY_DELAY_MS * 2);
    fakeServer().expectOne('/restaurants').flush('down', { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
    fakeServer().verify();
  });

  it('should NOT try again after 404, because asking again would not help', () => {
    let failed = false;
    TestBed.inject(HttpClient)
      .get('/restaurants/999')
      .subscribe({ error: () => (failed = true) });

    fakeServer().expectOne('/restaurants/999').flush('Not found', { status: 404, statusText: 'Not Found' });
    vi.advanceTimersByTime(RETRY_DELAY_MS * 5);

    expect(failed).toBe(true);
    fakeServer().verify();
  });

  it('should NOT repeat a POST, so an order is never sent twice', () => {
    let failed = false;
    TestBed.inject(HttpClient)
      .post('/orders', {})
      .subscribe({ error: () => (failed = true) });

    fakeServer().expectOne('/orders').flush('down', { status: 503, statusText: 'Unavailable' });
    vi.advanceTimersByTime(RETRY_DELAY_MS * 5);

    expect(failed).toBe(true);
    fakeServer().verify();
  });
});
