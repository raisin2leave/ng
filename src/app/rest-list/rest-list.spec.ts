import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RestList, SEARCH_DELAY_MS } from './rest-list';
import { API_URL } from '../api';
import { answerRestaurantList, fakeServer, provideTestApi, seedRestaurants, settle } from '../testing/api-test';

describe('RestList (Lab 7 FR-01: restaurants from the API)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...provideTestApi()] });
  });

  function openList() {
    const fixture = TestBed.createComponent(RestList);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  it('Loading: should tell the user that restaurants are being loaded', () => {
    const { page } = openList();

    expect(page.querySelector('[role="status"]')?.textContent).toContain('Ładowanie restauracji…');
    expect(page.querySelectorAll('app-rest-card').length).toBe(0);
  });

  it('Success: should show the restaurants from the API', async () => {
    const { fixture, page } = openList();
    await answerRestaurantList();
    fixture.detectChanges();

    expect(page.querySelector('[role="status"]')).toBeNull();
    expect(page.querySelectorAll('app-rest-card').length).toBe(200);
  });

  it('Empty: should say that there are no restaurants', async () => {
    const { fixture, page } = openList();
    await answerRestaurantList([]);
    fixture.detectChanges();

    expect(page.textContent).toContain('Brak restauracji do wyświetlenia.');
  });

  it('Error: should show "Unable to load data." and load again after Retry', async () => {
    const { fixture, page } = openList();
    fakeServer().expectOne(`${API_URL}/restaurants`).flush('down', { status: 500, statusText: 'Server Error' });
    await settle();
    fixture.detectChanges();

    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Unable to load data.');
    const retry = page.querySelector<HTMLButtonElement>('[role="alert"] button')!;
    expect(retry.textContent?.trim()).toBe('Retry');

    retry.click();
    fixture.detectChanges();
    TestBed.tick();
    await answerRestaurantList();
    fixture.detectChanges();

    expect(page.querySelector('[role="alert"]')).toBeNull();
    expect(page.querySelectorAll('app-rest-card').length).toBe(200);
  });

  async function waitForSearchDelay() {
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve, SEARCH_DELAY_MS + 50));
    TestBed.tick();
  }

  function restaurantsNamed(text: string) {
    return seedRestaurants.filter((restaurant) => restaurant.name.toLowerCase().includes(text));
  }

  it('should still use the other filters on the search results (Lab 2)', async () => {
    const { fixture, page } = openList();
    await answerRestaurantList();
    fixture.componentInstance.searchText.set('burger');
    fixture.componentInstance.selectedStatus.set('open');
    await waitForSearchDelay();
    fakeServer().expectOne(`${API_URL}/restaurants?name_like=burger`).flush(restaurantsNamed('burger'));
    await settle();
    fixture.detectChanges();

    expect(page.querySelectorAll('app-rest-card').length).toBe(11);
  });

  describe('bonus: debounced search in the API, cancelling old requests', () => {
    it('should wait until the user stops typing and send only one request', async () => {
      const { fixture } = openList();
      await answerRestaurantList();

      for (const text of ['b', 'bu', 'bur', 'burg']) {
        fixture.componentInstance.searchText.set(text);
        TestBed.tick();
      }
      fakeServer().expectNone((request) => request.params.has('name_like'));

      await waitForSearchDelay();
      fakeServer().expectOne(`${API_URL}/restaurants?name_like=burg`);
    });

    it('should cancel the request for an old search text when a new one starts', async () => {
      const { fixture, page } = openList();
      await answerRestaurantList();

      fixture.componentInstance.searchText.set('pizza');
      await waitForSearchDelay();
      const oldRequest = fakeServer().expectOne(`${API_URL}/restaurants?name_like=pizza`);
      fixture.detectChanges();
      expect(page.querySelector('[role="status"]')?.textContent).toContain('Szukanie restauracji…');

      fixture.componentInstance.searchText.set('sushi');
      await waitForSearchDelay();
      const newRequest = fakeServer().expectOne(`${API_URL}/restaurants?name_like=sushi`);

      expect(oldRequest.cancelled).toBe(true);
      expect(newRequest.cancelled).toBe(false);

      newRequest.flush(restaurantsNamed('sushi'));
      await settle();
      fixture.detectChanges();
      expect(page.querySelectorAll('app-rest-card').length).toBe(restaurantsNamed('sushi').length);
    });

    it('should show "Unable to load data." with Retry when the search fails, and the empty message when nothing is found', async () => {
      const { fixture, page } = openList();
      await answerRestaurantList();

      fixture.componentInstance.searchText.set('xyz');
      await waitForSearchDelay();
      fakeServer().expectOne(`${API_URL}/restaurants?name_like=xyz`).flush('down', { status: 500, statusText: 'Server Error' });
      await settle();
      fixture.detectChanges();
      expect(page.querySelector('[role="alert"]')?.textContent).toContain('Unable to load data.');

      page.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
      TestBed.tick();
      fakeServer().expectOne(`${API_URL}/restaurants?name_like=xyz`).flush([]);
      await settle();
      fixture.detectChanges();
      expect(page.textContent).toContain('Nie znaleziono restauracji.');
    });

    it('should escape special characters so that they are searched literally', async () => {
      const { fixture } = openList();
      await answerRestaurantList();

      fixture.componentInstance.searchText.set('  a.b  ');
      await waitForSearchDelay();
      fakeServer().expectOne((request) => request.params.get('name_like') === 'a\\.b');
    });
  });
});
