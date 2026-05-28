import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    // Not logged in? Redirect to login page
    return router.createUrlTree(['/login']);
  }

  if (
    authService.getUserRole() === 'admin' ||
    authService.getUserRole() === 'co-admin'
  ) {
    // Is admin? Allow route access
    return true;
  }

  // Logged in, but is just a 'buyer'? Redirect to shop
  return router.createUrlTree(['/shop']);
};
