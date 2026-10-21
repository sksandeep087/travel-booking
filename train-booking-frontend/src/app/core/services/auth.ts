
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  BehaviorSubject,
  tap,
  throwError
} from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly loggedInSubject =
    new BehaviorSubject<boolean>(!!localStorage.getItem('token'));

  readonly isLoggedIn$ = this.loggedInSubject.asObservable();

  // LOGIN
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      request
    ).pipe(
      tap(response => this.saveLoginData(response))
    );
  }

  // REGISTER
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      request
    );
  }


  // SEND OTP
  sendOtp(request: {
    mobile: string;
    purpose: 'LOGIN' | 'REGISTER';
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/send-otp`,
      request
    );
  }


  // FORGOT PASSWORD - SEND OTP
  sendForgotPasswordOtp(mobile: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/forgot-password/send-otp`,
      { mobile }
    );
  }

  // FORGOT PASSWORD - RESET PASSWORD
  resetForgotPassword(request: {
    mobile: string;
    otp: string;
    newPassword: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/forgot-password/reset`,
      request
    );
  }


  // VERIFY OTP
  verifyOtp(request: {
    mobile: string;
    otp: string;
    purpose: 'LOGIN' | 'REGISTER';
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/verify-otp`,
      request
    );
  }

  // LOGIN WITH OTP
  loginWithOtp(request: {
    mobile: string;
    otp: string;
  }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/verify-otp`,
      {
        ...request,
        purpose: 'LOGIN'
      }
    ).pipe(
      tap(response => this.saveLoginData(response))
    );
  }

  // REFRESH ACCESS TOKEN
  refreshSession(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return throwError(
        () => new Error('Refresh token not found. Please login again.')
      );
    }

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => this.saveLoginData(response))
    );
  }

  // SAVE LOGIN / REFRESH RESPONSE
  private saveLoginData(response: LoginResponse): void {
    if (!response.token) {
      throw new Error('Access token was not received from the server.');
    }

    localStorage.setItem('token', response.token);
    localStorage.setItem('tokenType', response.tokenType || 'Bearer');

    localStorage.setItem('userId', String(response.userId));
    localStorage.setItem('userName', response.name ?? '');
    localStorage.setItem('userEmail', response.email ?? '');
    localStorage.setItem('userRole', response.role ?? '');

    // Access-token expiry must be a parseable date/time.
    const accessExpiry = response.expiresAt
      ? new Date(response.expiresAt).getTime()
      : NaN;

    if (Number.isFinite(accessExpiry)) {
      localStorage.setItem('sessionExpiresAt', String(accessExpiry));
    } else {
      localStorage.removeItem('sessionExpiresAt');
      console.error('Invalid or missing access-token expiresAt');
    }

    // Save refreshed refresh token if returned.
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    // Refresh-token expiry.
    if (response.refreshTokenExpiresAt) {
      const refreshExpiry =
        new Date(response.refreshTokenExpiresAt).getTime();

      if (Number.isFinite(refreshExpiry)) {
        localStorage.setItem(
          'refreshTokenExpiresAt',
          String(refreshExpiry)
        );
      } else {
        localStorage.removeItem('refreshTokenExpiresAt');
      }
    }

    this.loggedInSubject.next(true);
  }

  // ACTIVITY API
  activityPing(): Observable<{
    success: boolean;
    message: string;
    expiresAt: string;
  }> {
    const token = this.getToken();

    if (!token) {
      return throwError(() => new Error('Access token not found'));
    }

    return this.http.post<{
      success: boolean;
      message: string;
      expiresAt: string;
    }>(
      `${this.apiUrl}/activity`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).pipe(
      tap(response => {
        if (response.expiresAt) {
          const expiry = new Date(response.expiresAt).getTime();

          if (Number.isFinite(expiry)) {
            localStorage.setItem('sessionExpiresAt', String(expiry));
          } else {
            console.error('Invalid activity expiresAt:', response.expiresAt);
          }
        }
      })
    );
  }

  // GET ACCESS TOKEN
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // GET TOKEN TYPE
  getTokenType(): string {
    return localStorage.getItem('tokenType') ?? 'Bearer';
  }

  // GET ACCESS TOKEN EXPIRY
  getSessionExpiresAt(): number {
    return Number(localStorage.getItem('sessionExpiresAt') ?? 0);
  }

  // SET ACCESS TOKEN EXPIRY
  setSessionExpiresAt(expiresAt: number): void {
    if (Number.isFinite(expiresAt)) {
      localStorage.setItem('sessionExpiresAt', String(expiresAt));
    }
  }

  // LOGIN STATUS
  isLoggedIn(): boolean {
    return !!this.getToken() &&
      !!localStorage.getItem('sessionExpiresAt');
  }

  // USER DETAILS
  getUserName(): string {
    return localStorage.getItem('userName') ?? '';
  }

  getUserEmail(): string {
    return localStorage.getItem('userEmail') ?? '';
  }

  getUserRole(): string {
    return localStorage.getItem('userRole') ?? '';
  }

  // CLEAR LOCAL SESSION
  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiresAt');
    localStorage.removeItem('sessionExpiresAt');

    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');

    this.loggedInSubject.next(false);
  }

  // LOGOUT
  logout(): void {
    const token = this.getToken();

    // Clear local session immediately.
    this.clearSession();

    if (token) {
      this.http.post(
        `${this.apiUrl}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ).subscribe({
        next: () => console.log('Backend logout successful.'),
        error: error => {
          console.warn('Backend logout request failed.', error);
        }
      });
    }
  }
}
