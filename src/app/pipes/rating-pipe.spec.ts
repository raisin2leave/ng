import { TestBed } from '@angular/core/testing';
import { RatingPipe } from './rating-pipe';

describe('RatingPipe', () => {
  function createPipe() {
    return TestBed.runInInjectionContext(() => new RatingPipe());
  }

  it('should show a star and the rating with a Polish decimal comma', () => {
    expect(createPipe().transform(4.7)).toBe('⭐ 4,7');
    expect(createPipe().transform(5)).toBe('⭐ 5,0');
  });

  it('should say "brak ocen" when there is no rating yet', () => {
    expect(createPipe().transform(0)).toBe('brak ocen');
  });
});
