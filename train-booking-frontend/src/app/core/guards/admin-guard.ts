import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Login check
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  // Role check
  if (authService.getUserRole() !== 'ADMIN') {
    return router.createUrlTree(['/']);
  }

  return true;
};