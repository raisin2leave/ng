import { Pipe, PipeTransform } from '@angular/core';
import { cuisineLabel } from '../models/restaurant';

@Pipe({
  name: 'cuisineLabel',
})
export class CuisineLabelPipe implements PipeTransform {
  transform(cuisine: string): string {
    return cuisineLabel(cuisine);
  }
}
