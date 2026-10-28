import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  it('should show links to the customer part and the admin panel', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const links = [...page.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links).toContain('/');
    expect(links).toContain('/admin');
  });
});
