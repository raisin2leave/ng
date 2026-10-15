import { Routes } from '@angular/router';
import { RestList } from './rest-list/rest-list';
import { RestDetails } from './rest-details/rest-details';

export const routes: Routes = [
  { path: '', component: RestList },
  { path: 'restaurant/:id', component: RestDetails },
  { path: '**', redirectTo: '' },
];
