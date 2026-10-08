import { Component } from '@angular/core';
import { Header } from './header/header';
import { RestList } from './rest-list/rest-list';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [Header, RestList, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
