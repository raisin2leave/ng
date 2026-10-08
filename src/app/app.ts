import { Component } from '@angular/core';
import { Header } from './header/header';
import { RestList } from './rest-list/rest-list';
import { Footer } from './footer/footer';

// ROOT component (the top of the tree): parent of Header, RestList and Footer
@Component({
  selector: 'app-root',
  imports: [Header, RestList, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
