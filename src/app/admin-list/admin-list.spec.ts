import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminList } from './admin-list';

describe('AdminList', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('should show a table with the required columns', () => {
    const fixture = TestBed.createComponent(AdminList);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const headers = [...page.querySelectorAll('th')].map((th) => th.textContent?.trim());
    expect(headers).toEqual(['Name', 'Cuisine', 'Rating', 'Active', 'Actions']);
  });

  it('should show all restaurants, including inactive ones', () => {
    const fixture = TestBed.createComponent(AdminList);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelectorAll('tbody tr').length).toBe(200);
    expect(page.textContent).toContain('Nieaktywna');
    expect(page.textContent).toContain('Polska');
  });
});
