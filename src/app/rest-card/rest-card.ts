import { Component, input } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ImageFallback } from '../directives/image-fallback';
import { RouterLink } from '@angular/router';
import { Restaurant } from '../models/restaurant';
import { CuisineLabelPipe } from '../pipes/cuisine-label-pipe';
import { RatingPipe } from '../pipes/rating-pipe';
import { DeliveryTimePipe } from '../pipes/delivery-time-pipe';

@Component({
  selector: 'app-rest-card',
  imports: [RouterLink, CurrencyPipe, NgOptimizedImage, ImageFallback, CuisineLabelPipe, RatingPipe, DeliveryTimePipe],
  templateUrl: './rest-card.html',
  styleUrl: './rest-card.scss',
})
export class RestCard {
  restaurant = input.required<Restaurant>();
  isFirstOnScreen = input(false);
}
