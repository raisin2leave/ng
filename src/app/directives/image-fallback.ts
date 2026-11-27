import { Directive, ElementRef, inject } from '@angular/core';

export const FALLBACK_IMAGE = '/images/no-image.svg';

@Directive({
  selector: 'img[appImageFallback]',
  host: {
    '(error)': 'showFallback()',
  },
})
export class ImageFallback {
  private image: HTMLImageElement = inject(ElementRef).nativeElement;

  showFallback() {
    if (this.image.src.endsWith(FALLBACK_IMAGE)) {
      return;
    }

    this.image.removeAttribute('srcset');
    this.image.src = FALLBACK_IMAGE;
  }
}
