import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RestList } from './rest-list';
import { API_URL } from '../api';
import { answerRestaurantList, fakeServer, provideTestApi, settle } from '../testing/api-test';

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

  it('should still filter the loaded restaurants (Lab 2)', async () => {
    const { fixture, page } = openList();
    await answerRestaurantList();
    fixture.componentInstance.searchText.set('burger');
    fixture.componentInstance.selectedStatus.set('open');
    fixture.detectChanges();

    expect(page.querySelectorAll('app-rest-card').length).toBe(11);
  });
});
