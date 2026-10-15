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

  it('should show a message for an unknown id', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RestDetails);
    fixture.componentRef.setInput('id', '9999');
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('Nie znaleziono restauracji.');
  });
});
