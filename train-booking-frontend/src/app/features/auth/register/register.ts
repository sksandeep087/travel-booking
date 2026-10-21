import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink
  ],


  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private readonly fb = inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);


  loading = false;

  errorMessage = '';

  successMessage = '';

  showPassword = false;

  showConfirmPassword = false;
  otpSent = false;
  otpVerified = false;
  otp = '';

  otpLoading = false;
  verifyOtpLoading = false;

  registerForm = this.fb.nonNullable.group({

    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    mobile: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ],

    confirmPassword: [
      '',
      [
        Validators.required
      ]
    ]

  }, {
    validators: this.passwordMatchValidator
  });


  // =========================
  // GETTERS
  // =========================

  get name() {
    return this.registerForm.controls.name;
  }

  get email() {
    return this.registerForm.controls.email;
  }

  get mobile() {
    return this.registerForm.controls.mobile;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get confirmPassword() {
    return this.registerForm.controls.confirmPassword;
  }


  // =========================
  // PASSWORD MATCH
  // =========================

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password =
      control.get('password')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;

    if (
      password &&
      confirmPassword &&
      password !== confirmPassword
    ) {
      return {
        passwordMismatch: true
      };
    }

    return null;
  }


  // =========================
  // REGISTER
  // =========================

  
register(event?: Event): void {
  event?.preventDefault();

  this.errorMessage = '';
  this.successMessage = '';

  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  if (this.loading) {
    return;
  }

  this.loading = true;

  const { name, email, mobile, password } =
    this.registerForm.getRawValue();

  this.authService.register({
    name: name.trim(),
    email: email.trim(),
    mobile: mobile.trim(),
    password
  }).subscribe({
    next: (response) => {
      this.loading = false;
      this.otpSent = true;
      this.successMessage =
        response?.message ??
        'OTP generated. Please verify your mobile number.';

      Swal.fire({
        icon: 'success',
        title: 'OTP Sent',
        text: this.successMessage,
        confirmButtonColor: '#0875e1'
      });
    },
    error: (error) => {
      this.loading = false;

      const message =
        error?.error?.message ??
        'Unable to start registration. Please try again.';

      this.errorMessage = message;

      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: message,
        confirmButtonColor: '#0875e1'
      });
    }
  });
}

sendOtpAgain(): void {
  this.errorMessage = '';

  const mobile = this.registerForm.controls.mobile.value.trim();

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    this.errorMessage = 'Please enter a valid 10-digit mobile number.';
    return;
  }

  if (this.otpLoading) {
    return;
  }

  this.otpLoading = true;

  this.authService.sendOtp({
    mobile,
    purpose: 'REGISTER'
  }).subscribe({
    next: (response) => {
      this.otpLoading = false;
      this.successMessage =
        response?.message ?? 'OTP generated successfully.';
    },
    error: (error) => {
      this.otpLoading = false;
      this.errorMessage =
        error?.error?.message ?? 'Unable to resend OTP.';
    }
  });
}

verifyOtp(): void {
  this.errorMessage = '';
  this.successMessage = '';

  if (!/^\d{6}$/.test(this.otp)) {
    this.errorMessage = 'Please enter a valid 6-digit OTP.';
    return;
  }

  if (this.verifyOtpLoading) {
    return;
  }

  this.verifyOtpLoading = true;

  const mobile = this.registerForm.controls.mobile.value.trim();

  this.authService.verifyOtp({
    mobile,
    otp: this.otp,
    purpose: 'REGISTER'
  }).subscribe({
    next: (response) => {
      this.verifyOtpLoading = false;
      this.otpVerified = true;

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: response?.message ??
          'Your account has been created successfully.',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#0875e1'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    },
    error: (error) => {
      this.verifyOtpLoading = false;
      this.errorMessage =
        error?.error?.message ?? 'Invalid OTP. Please try again.';
    }
  });
}



  // =========================
  // PASSWORD TOGGLE
  // =========================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }


  // =========================
  // CONFIRM PASSWORD TOGGLE
  // =========================

  toggleConfirmPassword(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;

  }

}