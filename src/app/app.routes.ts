import { Routes } from '@angular/router';
import { RestList } from './rest-list/rest-list';
import { RestDetails } from './rest-details/rest-details';
import { AdminList } from './admin-list/admin-list';
import { RestaurantForm } from './restaurant-form/restaurant-form';
import { AdminMenus } from './admin-menus/admin-menus';
import { ProductForm } from './product-form/product-form';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', component: RestList },
  { path: 'restaurant/:id', component: RestDetails },
  { path: 'register', component: Register },
  { path: 'admin', component: AdminList },
  { path: 'admin/new', component: RestaurantForm },
  { path: 'admin/edit/:id', component: RestaurantForm },
  { path: 'admin/menus', redirectTo: 'admin/menus/american', pathMatch: 'full' },
  { path: 'admin/menus/:cuisine', component: AdminMenus },
  { path: 'admin/menus/:cuisine/new/:category', component: ProductForm },
  { path: 'admin/menus/:cuisine/edit/:productId', component: ProductForm },
  { path: '**', redirectTo: '' },
];
