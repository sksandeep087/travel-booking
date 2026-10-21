import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem('token');

  // Login, register and refresh must not trigger refresh logic.
  // Logout is intentionally excluded so its access token is attached.
  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  if (isAuthRequest) {
    return next(req);
  }

  // Attach the current access token if available.
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      console.error('HTTP ERROR:', error.status, req.url);

      // Handle forbidden access separately.
      if (error.status === 403) {
  console.warn(
    'Access forbidden. URL:',
    req.url
  );

  return throwError(() => error);
}

      // Only attempt refresh for an authenticated request
      // that failed with 401.
      if (error.status !== 401 || !token) {
        return throwError(() => error);
      }

      // Attempt to refresh the access token.
      return authService.refreshSession().pipe(

        // If refresh itself fails, clear the session.
        catchError((refreshError) => {
          console.warn('Session refresh failed.');

          authService.clearSession();
          router.navigate(['/login']);

          return throwError(() => refreshError);
        }),

        // Retry the original request with the new access token.
        switchMap((response) => {

          const newToken =
            response.token ||
            localStorage.getItem('token');

          if (!newToken) {
            authService.clearSession();
            router.navigate(['/login']);

            return throwError(
              () => new Error('New access token was not received')
            );
          }

          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });

          return next(retryReq).pipe(
            catchError((retryError: HttpErrorResponse) => {

              // If the retried request is still unauthorized,
              // the new access token is not accepted.
              if (retryError.status === 401) {
                authService.clearSession();
                router.navigate(['/login']);
              }

              return throwError(() => retryError);
            })
          );
        })
      );
    })
  );
};