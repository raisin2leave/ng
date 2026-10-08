import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the app name in the header', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges(); // draw the HTML
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('app-header')?.textContent).toContain('FoodApp');
  });
});
