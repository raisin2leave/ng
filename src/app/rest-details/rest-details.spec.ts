import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RestDetails } from './rest-details';

describe('RestDetails', () => {
  it('should show the restaurant with the given id', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Pierogarnia Pod Aniołami');
    expect(page.textContent).toContain('Warszawa');
  });

  it('should show the menu of the restaurant cuisine, divided into categories', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const categories = [...page.querySelectorAll('.menu-category h3')].map((h) => h.textContent);
    expect(categories).toEqual(['Zupy', 'Pierogi', 'Dania główne', 'Desery']);
    expect(page.textContent).toContain('Pierogi ruskie');
  });

  it('should add available products to the cart summary', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.cart-summary')?.textContent).toContain('Koszyk jest pusty');

    const buttons = [...page.querySelectorAll<HTMLButtonElement>('app-product-card button')];
    const enabled = buttons.filter((b) => !b.disabled);
    enabled[0].click();
    enabled[1].click();
    fixture.detectChanges();

    expect(page.querySelector('.cart-summary')?.textContent).toContain('Koszyk: 2 szt.');
  });

  it('should show a message for an unknown id', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '9999');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Nie znaleziono restauracji.');
  });
});
