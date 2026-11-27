import { Pipe, PipeTransform } from '@angular/core';
import { Restaurant } from '../models/restaurant';

@Pipe({
  name: 'deliveryTime',
})
export class DeliveryTimePipe implements PipeTransform {
  transform(restaurant: Pick<Restaurant, 'deliveryTimeMin' | 'deliveryTimeMax'>): string {
    if (restaurant.deliveryTimeMin === restaurant.deliveryTimeMax) {
      return `${restaurant.deliveryTimeMin} min`;
    }

    return `${restaurant.deliveryTimeMin}–${restaurant.deliveryTimeMax} min`;
  }
}
