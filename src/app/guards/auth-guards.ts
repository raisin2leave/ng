import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

function goToLogin() {
  const router = inject(Router);
  const wantedPage = router.currentNavigation()?.extractedUrl;

  if (!wantedPage) {
    return router.createUrlTree(['/login']);
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: router.serializeUrl(wantedPage) },
  });
}

export const loggedInGuard: CanActivateFn = () => {
  const auth = inject(Auth);

  if (auth.isLoggedIn()) {
    return true;
  }

  return goToLogin();
};

export const adminGuard: CanMatchFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return goToLogin();
  }

  if (auth.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
