import { Routes } from '@angular/router';
import { RestList } from './rest-list/rest-list';
import { RestDetails } from './rest-details/rest-details';
import { Register } from './register/register';
import { Login } from './login/login';
import { Forbidden } from './forbidden/forbidden';
import { Profile } from './profile/profile';
import { CartPage } from './cart-page/cart-page';
import { adminGuard, loggedInGuard } from './guards/auth-guards';
import { cartReadyGuard } from './guards/cart-guard';

export const routes: Routes = [
  { path: '', component: RestList },
  { path: 'restaurant/:id', component: RestDetails },
  { path: 'cart', component: CartPage },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout').then((file) => file.Checkout),
    canActivate: [loggedInGuard, cartReadyGuard],
  },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'forbidden', component: Forbidden },
  { path: 'profile', component: Profile, canActivate: [loggedInGuard] },
  {
    path: 'orders',
    loadComponent: () => import('./my-orders/my-orders').then((file) => file.MyOrders),
    canActivate: [loggedInGuard],
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./order-details/order-details').then((file) => file.OrderDetails),
    canActivate: [loggedInGuard],
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    loadChildren: () => import('./admin/admin.routes').then((file) => file.adminRoutes),
  },
  { path: '**', redirectTo: '' },
];
