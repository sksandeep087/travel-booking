import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit, OnDestroy {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private sessionTimer: ReturnType<typeof setInterval> | null = null;
  private popupCountdownTimer: ReturnType<typeof setInterval> | null = null;

  private authSubscription?: Subscription;
  private activitySubscription?: Subscription;

  private lastActivitySent = 0;
  private readonly activityThrottleMs = 15000;
  private readonly inactivityTimeoutMs = 15 * 60 * 1000;
  private readonly popupTimeoutSeconds = 60;

  isLoggedIn = false;

  userName = '';
  userEmail = '';

  menuOpen = false;
  userDropdownOpen = false;

  sessionTimeLeft = '15:00';

  showSessionPopup = false;
  isRefreshingSession = false;
  popupTimeLeft = this.popupTimeoutSeconds;

  sessionMessage =
    'Your session has expired. Would you like to continue?';

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      loggedIn => {
        this.isLoggedIn = loggedIn;

        if (loggedIn) {
          this.userName = this.authService.getUserName();
          this.userEmail = this.authService.getUserEmail();

          this.startSessionTimer();
        } else {
          this.userName = '';
          this.userEmail = '';
          this.userDropdownOpen = false;
          this.sessionTimeLeft = '';
          this.showSessionPopup = false;
          this.isRefreshingSession = false;

          this.stopSessionTimer();
          this.clearPopupCountdown();

          this.activitySubscription?.unsubscribe();
          this.activitySubscription = undefined;
        }

        this.cdr.detectChanges();
      }
    );
  }

  // Reset the inactivity deadline when the user interacts with the page.
  @HostListener('document:mousemove')
  @HostListener('document:click')
  @HostListener('document:keydown')
  @HostListener('document:scroll')
  @HostListener('document:touchstart')
  onUserActivity(): void {
    if (!this.isLoggedIn || this.showSessionPopup) {
      return;
    }

    const now = Date.now();

    this.authService.setSessionExpiresAt(
      now + this.inactivityTimeoutMs
    );

    if (this.sessionTimer === null) {
      this.startSessionTimer();
    } else {
      this.updateSessionTimer();
    }

    // Send the activity request at most once every 15 seconds.
    if (now - this.lastActivitySent < this.activityThrottleMs) {
      return;
    }

    this.lastActivitySent = now;

    this.activitySubscription?.unsubscribe();

    this.activitySubscription = this.authService.activityPing()
      .subscribe({
        next: response => {
          console.log('Activity renewed:', response.expiresAt);
          this.updateSessionTimer();
        },
        error: error => {
          console.error(
            'Activity API error:',
            error.status,
            error.error
          );
        }
      });
  }

  // Start the session countdown.
  private startSessionTimer(): void {
    this.stopSessionTimer();
    this.updateSessionTimer();

    if (!this.showSessionPopup && this.isLoggedIn) {
      this.sessionTimer = setInterval(() => {
        this.updateSessionTimer();
      }, 1000);
    }
  }

  // Update the visible session countdown.
  private updateSessionTimer(): void {
    const expiresAt = this.authService.getSessionExpiresAt();

    if (!expiresAt || !Number.isFinite(expiresAt)) {
      this.sessionTimeLeft = '';
      this.cdr.detectChanges();
      return;
    }

    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
      this.sessionTimeLeft = '00:00';

      this.showExpiryPopup(
        'Your session has expired. Would you like to continue?'
      );
      return;
    }

    const totalSeconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    this.sessionTimeLeft =
      `${this.pad(minutes)}:${this.pad(seconds)}`;

    this.cdr.detectChanges();
  }

  // Open the popup and start its 60-second countdown.
  private showExpiryPopup(message: string): void {
    if (this.showSessionPopup) {
      return;
    }

    this.stopSessionTimer();

    this.showSessionPopup = true;
    this.sessionMessage = message;

    this.startPopupCountdown();

    this.cdr.detectChanges();
  }

  // Automatically log out if neither button is clicked within 60 seconds.
  private startPopupCountdown(): void {
    this.clearPopupCountdown();
    this.popupTimeLeft = this.popupTimeoutSeconds;

    this.popupCountdownTimer = setInterval(() => {
      this.popupTimeLeft--;

      if (this.popupTimeLeft <= 0) {
        this.popupTimeLeft = 0;
        this.clearPopupCountdown();
        this.forceLogoutFromSessionPopup();
        return;
      }

      this.cdr.detectChanges();
    }, 1000);
  }

  private clearPopupCountdown(): void {
    if (this.popupCountdownTimer !== null) {
      clearInterval(this.popupCountdownTimer);
      this.popupCountdownTimer = null;
    }
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private stopSessionTimer(): void {
    if (this.sessionTimer !== null) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // Continue the session using the existing refresh-token API.
  continueSession(): void {
    if (this.isRefreshingSession || !this.showSessionPopup) {
      return;
    }

    // The user clicked Continue, so stop the popup countdown.
    this.clearPopupCountdown();

    this.isRefreshingSession = true;
    this.sessionMessage = 'Refreshing your session...';

    this.authService.refreshSession().subscribe({
      next: response => {
        console.log('Refresh API success:', response);

        this.isRefreshingSession = false;
        this.showSessionPopup = false;
        this.lastActivitySent = 0;

        this.clearPopupCountdown();
        this.startSessionTimer();

        this.cdr.detectChanges();
      },
      error: error => {
        console.error(
          'Refresh API failed:',
          error.status,
          error.error
        );

        this.isRefreshingSession = false;
        this.sessionMessage =
          'Session refresh failed. Please log in again.';

        // Give the user another 60 seconds to choose an action.
        this.startPopupCountdown();

        this.showSessionPopup = true;
        this.cdr.detectChanges();
      }
    });
  }

  // User manually logs out from the popup.
  logoutFromSessionPopup(): void {
    if (this.isRefreshingSession) {
      return;
    }

    this.forceLogoutFromSessionPopup();
  }

  // Shared logout logic, including automatic logout at 60 seconds.
  private forceLogoutFromSessionPopup(): void {
    this.clearPopupCountdown();
    this.stopSessionTimer();

    this.showSessionPopup = false;
    this.isRefreshingSession = false;
    this.sessionTimeLeft = '';

    this.activitySubscription?.unsubscribe();
    this.activitySubscription = undefined;

    this.authService.logout();
    this.router.navigate(['/login']);

    this.cdr.detectChanges();
  }

  // Navigation methods.
  goHome(): void {
    this.menuOpen = false;
    this.userDropdownOpen = false;
    this.router.navigate(['/']);
  }

  goToMyBookings(): void {
    this.menuOpen = false;
    this.userDropdownOpen = false;
    this.router.navigate(['/my-bookings']);
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  goToAdminDashboard(): void {
    this.menuOpen = false;
    this.userDropdownOpen = false;
    this.router.navigate(['/admin/dashboard']);
  }

  goToLogin(): void {
    this.menuOpen = false;
    this.userDropdownOpen = false;
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.menuOpen = false;
    this.userDropdownOpen = false;
    this.router.navigate(['/register']);
  }

  toggleUserDropdown(): void {
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  logout(): void {
    this.menuOpen = false;
    this.userDropdownOpen = false;

    this.stopSessionTimer();
    this.clearPopupCountdown();

    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;

    if (this.menuOpen) {
      this.userDropdownOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.stopSessionTimer();
    this.clearPopupCountdown();

    this.authSubscription?.unsubscribe();
    this.activitySubscription?.unsubscribe();
  }
}