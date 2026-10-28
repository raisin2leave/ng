import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminList } from './admin-list';

describe('AdminList', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createTable() {
    const fixture = TestBed.createComponent(AdminList);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  function rowNames(page: HTMLElement) {
    return [...page.querySelectorAll('tbody tr')].map((tr) => tr.querySelector('td')?.textContent?.trim());
  }

  it('should show a table with the required columns', () => {
    const { page } = createTable();
    const headers = [...page.querySelectorAll('th')].map((th) => th.textContent?.replace(/[↕▲▼]/g, '').trim());
    expect(headers).toEqual(['Name', 'Cuisine', 'Rating', 'Active', 'Actions']);
  });

  it('should show all restaurants, including inactive ones', () => {
    const { page } = createTable();
    expect(page.querySelectorAll('tbody tr').length).toBe(200);
    expect(page.textContent).toContain('Nieaktywna');
    expect(page.textContent).toContain('Polska');
  });

  it('should deactivate a restaurant without deleting it, and activate it again', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { fixture, page } = createTable();
    const firstRow = () => page.querySelector('tbody tr')!;

    expect(firstRow().textContent).toContain('Aktywna');
    firstRow().querySelector<HTMLButtonElement>('.btn-outline-danger')!.click();
    fixture.detectChanges();

    expect(firstRow().textContent).toContain('Nieaktywna');
    expect(firstRow().textContent).toContain('Pierogarnia Pod Aniołami');
    expect(page.querySelectorAll('tbody tr').length).toBe(200);

    firstRow().querySelector<HTMLButtonElement>('.btn-outline-success')!.click();
    fixture.detectChanges();
    expect(firstRow().textContent).not.toContain('Nieaktywna');
  });

  describe('bonus tasks', () => {
    it('should ask for confirmation and NOT deactivate when the admin cancels', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const { fixture, page } = createTable();
      const firstRow = () => page.querySelector('tbody tr')!;

      firstRow().querySelector<HTMLButtonElement>('.btn-outline-danger')!.click();
      fixture.detectChanges();

      expect(confirmSpy).toHaveBeenCalledWith(
        'Czy na pewno chcesz dezaktywować restaurację „Pierogarnia Pod Aniołami”?',
      );
      expect(firstRow().textContent).not.toContain('Nieaktywna');
    });

    it('should search restaurants by name', () => {
      const { fixture, page } = createTable();
      fixture.componentInstance.searchText.set('BURGER');
      fixture.detectChanges();

      const names = rowNames(page);
      expect(names.length).toBe(12);
      expect(names.every((name) => name?.toLowerCase().includes('burger'))).toBe(true);
      expect(page.textContent).toContain('Wyświetlono 12 z 200 restauracji');
    });

    it('should filter active and inactive restaurants', () => {
      const { fixture, page } = createTable();

      fixture.componentInstance.statusFilter.set('inactive');
      fixture.detectChanges();
      expect(page.querySelectorAll('tbody tr').length).toBe(14);
      expect(page.querySelector('tbody')!.textContent).not.toContain('Aktywna ');

      fixture.componentInstance.statusFilter.set('active');
      fixture.detectChanges();
      expect(page.querySelectorAll('tbody tr').length).toBe(186);
    });

    it('should show a message when nothing matches', () => {
      const { fixture, page } = createTable();
      fixture.componentInstance.searchText.set('xyz-brak');
      fixture.detectChanges();
      expect(page.querySelector('tbody')!.textContent).toContain('Nie znaleziono restauracji.');
    });

    it('should sort by a column when its header is clicked, and reverse on a second click', () => {
      const { fixture, page } = createTable();
      const ratingHeader = page.querySelectorAll<HTMLButtonElement>('.sort-button')[2];

      ratingHeader.click();
      fixture.detectChanges();
      let ratings = fixture.componentInstance.visibleRestaurants().map((r) => r.rating);
      expect(ratings[0]).toBe(Math.min(...ratings));
      expect(page.querySelectorAll('th')[2].getAttribute('aria-sort')).toBe('ascending');

      ratingHeader.click();
      fixture.detectChanges();
      ratings = fixture.componentInstance.visibleRestaurants().map((r) => r.rating);
      expect(ratings[0]).toBe(Math.max(...ratings));
      expect(page.querySelectorAll('th')[2].getAttribute('aria-sort')).toBe('descending');

      const nameHeader = page.querySelectorAll<HTMLButtonElement>('.sort-button')[0];
      nameHeader.click();
      fixture.detectChanges();
      const names = rowNames(page) as string[];
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b, 'pl'));
      expect(names).toEqual(sortedNames);
    });
  });
});
