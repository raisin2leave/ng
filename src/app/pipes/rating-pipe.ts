import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({
  name: 'rating',
})
export class RatingPipe implements PipeTransform {
  private locale = inject(LOCALE_ID);

  transform(rating: number): string {
    if (rating <= 0) {
      return 'brak ocen';
    }

    return `⭐ ${formatNumber(rating, this.locale, '1.1-1')}`;
  }
}
