import { Component } from '@angular/core';
import { RestCard } from '../rest-card/rest-card';
import { Restaurant } from '../models/restaurant';
import restaurantsData from '../data/restaurants.json';

// PARENT component: it knows ALL restaurants and creates one card for each
@Component({
  selector: 'app-rest-list',
  imports: [RestCard],
  templateUrl: './rest-list.html',
  styleUrl: './rest-list.scss',
})
export class RestList {
  // All 200 restaurants from the JSON file
  restaurants: Restaurant[] = restaurantsData as Restaurant[];
}
