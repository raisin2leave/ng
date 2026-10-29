import { Routes } from '@angular/router';
import { RestList } from './rest-list/rest-list';
import { RestDetails } from './rest-details/rest-details';
import { Register } from './register/register';
import { Login } from './login/login';
import { Forbidden } from './forbidden/forbidden';
import { Profile } from './profile/profile';
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
    canMatch: [adminGuard],
    loadChildren: () => import('./admin/admin.routes').then((file) => file.adminRoutes),
  },
  { path: '**', redirectTo: '' },
];
