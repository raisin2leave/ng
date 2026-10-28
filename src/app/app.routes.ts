import { Routes } from '@angular/router';
import { RestList } from './rest-list/rest-list';
import { RestDetails } from './rest-details/rest-details';
import { AdminList } from './admin-list/admin-list';

export const routes: Routes = [
  { path: '', component: RestList },
  { path: 'restaurant/:id', component: RestDetails },
  { path: 'admin', component: AdminList },
  { path: '**', redirectTo: '' },
];
