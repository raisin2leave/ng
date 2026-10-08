import { Component, input } from '@angular/core';
import { Restaurant } from '../models/restaurant';

@Component({
  selector: 'app-rest-card',
  imports: [],
  templateUrl: './rest-card.html',
  styleUrl: './rest-card.scss',
})
export class RestCard {
  restaurant = input.required<Restaurant>();
}
