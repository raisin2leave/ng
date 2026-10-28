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

  it('should deactivate a restaurant without deleting it, and activate it again', () => {
    const fixture = TestBed.createComponent(AdminList);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
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
});
