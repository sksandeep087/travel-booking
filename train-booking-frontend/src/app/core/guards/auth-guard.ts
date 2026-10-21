import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth';


export const authGuard: CanActivateFn = (
  route,
  state
) => {

  const router = inject(Router);

  const authService = inject(AuthService);


  // =====================================================
  // USER LOGGED IN
  // =====================================================

  if (authService.isLoggedIn()) {

    return true;

  }


  // =====================================================
  // USER NOT LOGGED IN
  // =====================================================

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl: state.url
      }
    }
  );

};