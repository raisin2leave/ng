import { Component, input } from '@angular/core';
import { Restaurant } from '../models/restaurant';

// CHILD component: it shows ONE restaurant that the parent (RestList) gives it
@Component({
  selector: 'app-rest-card',
  imports: [],
  templateUrl: './rest-card.html',
  styleUrl: './rest-card.scss',
})
export class RestCard {
  // The restaurant received from the parent. Read it in HTML as restaurant()
  restaurant = input.required<Restaurant>();
}
