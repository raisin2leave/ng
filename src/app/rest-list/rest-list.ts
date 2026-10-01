import { Component } from '@angular/core';
import { RestCard } from '../rest-card/rest-card';

@Component({
  selector: 'app-rest-list',
  imports: [RestCard],
  templateUrl: './rest-list.html',
  styleUrl: './rest-list.scss',
})
export class RestList {}
