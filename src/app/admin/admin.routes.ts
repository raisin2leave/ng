import { Routes } from '@angular/router';
import { AdminList } from '../admin-list/admin-list';
import { RestaurantForm } from '../restaurant-form/restaurant-form';
import { AdminMenus } from '../admin-menus/admin-menus';
import { ProductForm } from '../product-form/product-form';
import { AdminUsers } from '../admin-users/admin-users';
import { AdminUserForm } from '../admin-user-form/admin-user-form';

export const adminRoutes: Routes = [
  { path: '', component: AdminList },
  { path: 'new', component: RestaurantForm },
  { path: 'edit/:id', component: RestaurantForm },
  { path: 'menus', redirectTo: 'menus/american', pathMatch: 'full' },
  { path: 'menus/:cuisine', component: AdminMenus },
  { path: 'menus/:cuisine/new/:category', component: ProductForm },
  { path: 'menus/:cuisine/edit/:productId', component: ProductForm },
  { path: 'users', component: AdminUsers },
  { path: 'users/new', component: AdminUserForm },
];
