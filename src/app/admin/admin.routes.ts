import { Routes } from '@angular/router';
import { AdminList } from '../admin-list/admin-list';
import { RestaurantForm } from '../restaurant-form/restaurant-form';
import { AdminMenus } from '../admin-menus/admin-menus';
import { ProductForm } from '../product-form/product-form';
import { AdminUsers } from '../admin-users/admin-users';
import { AdminUserForm } from '../admin-user-form/admin-user-form';
import { AdminOrders } from '../admin-orders/admin-orders';
import { AdminOrderDetails } from '../admin-order-details/admin-order-details';

export const adminRoutes: Routes = [
  { path: '', component: AdminList },
  { path: 'new', component: RestaurantForm },
  { path: 'edit/:id', component: RestaurantForm },
  { path: 'menus/:restaurantId', component: AdminMenus },
  { path: 'menus/:restaurantId/new/:categoryId', component: ProductForm },
  { path: 'menus/:restaurantId/edit/:productId', component: ProductForm },
  { path: 'users', component: AdminUsers },
  { path: 'users/new', component: AdminUserForm },
  { path: 'orders', component: AdminOrders },
  { path: 'orders/:id', component: AdminOrderDetails },
];
