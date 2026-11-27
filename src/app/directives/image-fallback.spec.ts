import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FALLBACK_IMAGE, ImageFallback } from './image-fallback';

@Component({
  imports: [ImageFallback],
  template: `<img src="https://example.com/broken.jpg" srcset="https://example.com/broken.jpg 1x" alt="Burger" appImageFallback>`,
})
class Host {}

describe('ImageFallback directive', () => {
  it('should show the placeholder picture when the image cannot be loaded', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');

    image.dispatchEvent(new Event('error'));

    expect(image.getAttribute('src')).toBe(FALLBACK_IMAGE);
    expect(image.hasAttribute('srcset')).toBe(false);
  });

  it('should not try again when the placeholder itself fails', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');

    image.dispatchEvent(new Event('error'));
    const setter = vi.spyOn(image, 'src', 'set');
    image.dispatchEvent(new Event('error'));

    expect(setter).not.toHaveBeenCalled();
  });
});
