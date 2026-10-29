import { Routes } from '@angular/router';
import { RestList } from './rest-list/rest-list';
import { RestDetails } from './rest-details/rest-details';
import { AdminList } from './admin-list/admin-list';
import { RestaurantForm } from './restaurant-form/restaurant-form';
import { AdminMenus } from './admin-menus/admin-menus';
import { ProductForm } from './product-form/product-form';
import { Register } from './register/register';
import { Login } from './login/login';
import { Forbidden } from './forbidden/forbidden';
import { Profile } from './profile/profile';
import { AdminUsers } from './admin-users/admin-users';
import { AdminUserForm } from './admin-user-form/admin-user-form';
import { adminGuard, loggedInGuard } from './guards/auth-guards';

export const routes: Routes = [
  { path: '', component: RestList },
  { path: 'restaurant/:id', component: RestDetails },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'forbidden', component: Forbidden },
  { path: 'profile', component: Profile, canActivate: [loggedInGuard] },
  {
    path: 'admin',
    canActivateChild: [adminGuard],
    children: [
      { path: '', component: AdminList },
      { path: 'new', component: RestaurantForm },
      { path: 'edit/:id', component: RestaurantForm },
      { path: 'menus', redirectTo: 'menus/american', pathMatch: 'full' },
      { path: 'menus/:cuisine', component: AdminMenus },
      { path: 'menus/:cuisine/new/:category', component: ProductForm },
      { path: 'menus/:cuisine/edit/:productId', component: ProductForm },
      { path: 'users', component: AdminUsers },
      { path: 'users/new', component: AdminUserForm },
    ],
  },
  { path: '**', redirectTo: '' },
];
