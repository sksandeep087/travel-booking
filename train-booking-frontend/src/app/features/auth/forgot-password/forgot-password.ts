
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  mobile = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  otpSent = false;
  loading = false;
  message = '';
  errorMessage = '';

  sendOtp(): void {
    this.clearMessages();

    if (!/^[0-9]{10}$/.test(this.mobile)) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    this.loading = true;

    this.authService.sendForgotPasswordOtp(this.mobile)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: response => {
          this.otpSent = true;
          this.message = response.message || 'OTP sent successfully.';
        },
        error: error => {
          this.errorMessage =
            error?.error?.message ||
            'Unable to send OTP. Please try again.';
        }
      });
  }

  resetPassword(): void {
    this.clearMessages();

    if (!/^[0-9]{6}$/.test(this.otp)) {
      this.errorMessage = 'Please enter a valid 6-digit OTP.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must contain at least 6 characters.';
      return;
    }

    if (this.newPassword.length > 72) {
      this.errorMessage = 'Password cannot exceed 72 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match.';
      return;
    }

    this.loading = true;

    this.authService.resetForgotPassword({
      mobile: this.mobile,
      otp: this.otp,
      newPassword: this.newPassword
    })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: response => {
          this.newPassword = '';
          this.confirmPassword = '';
          this.otp = '';

          Swal.fire({
            icon: 'success',
            title: 'Password Reset Successful!',
            text: response.message ||
              'Your password has been reset successfully.',
            confirmButtonText: 'Continue to Login',
            confirmButtonColor: '#1769e0',
            allowOutsideClick: false
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: error => {
          this.errorMessage =
            error?.error?.message ||
            'Unable to reset password. Please try again.';
        }
      });
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }
}
