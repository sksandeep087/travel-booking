
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ChangeDetectorRef, Component, inject } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private readonly fb =
    inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);


  loading = false;

  errorMessage = '';

  showPassword = false;
  loginMode: 'PASSWORD' | 'OTP' = 'PASSWORD';

  mobile = '';
  otp = '';

  otpSent = false;
  otpLoading = false;
  otpVerifying = false;

  // =====================================================
  // LOGIN RETURN URL
  // =====================================================

  returnUrl = '/';


  // =====================================================
  // LOGIN FORM
  // =====================================================

  loginForm = this.fb.nonNullable.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ]

  });


  // =====================================================
  // INIT
  // =====================================================
  passwordResetMessage = '';

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      this.route.queryParamMap.subscribe(params => {
        if (params.get('passwordReset') === 'success') {
          this.passwordResetMessage =
            'Password reset successfully! Please login with your new password.';
        }
      });
      const returnUrl =
        params.get('returnUrl');


      if (
        returnUrl &&
        returnUrl.startsWith('/')
      ) {

        this.returnUrl =
          returnUrl;

      } else {

        this.returnUrl =
          '/';

      }

    });

  }


  // =====================================================
  // GETTERS
  // =====================================================

  get email() {

    return this.loginForm.controls.email;

  }


  get password() {

    return this.loginForm.controls.password;

  }


  // =====================================================
  // LOGIN
  // =====================================================

  // =====================================================
  // LOGIN
  // =====================================================

  login(event?: Event): void {

    event?.preventDefault();
    event?.stopPropagation();

    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    const formValue = this.loginForm.getRawValue();

    const request = {
      email: formValue.email.trim(),
      password: formValue.password
    };

    this.authService
      .login(request)
      .pipe(
        finalize(() => {

          console.log('Login request completed');

          this.loading = false;

          this.cdr.detectChanges();

        })
      )
      .subscribe({

        next: (response) => {

          console.log('Login Success:', response);

          this.loading = false;

          this.cdr.detectChanges();

          this.router.navigate([this.returnUrl]);

        },

        error: (error) => {

          console.error('Login Error:', error);

          this.loading = false;

          this.errorMessage =
            error?.error?.message ??
            error?.error?.error ??
            'Invalid email or password. Please try again.';

          console.log('Loading:', this.loading);
          console.log('Error Message:', this.errorMessage);

          this.cdr.detectChanges();

        }

      });
  }


  // =====================================================
  // PASSWORD TOGGLE
  // =====================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }

  useLoginMode(mode: 'PASSWORD' | 'OTP'): void {
    this.loginMode = mode;
    this.errorMessage = '';
  }

  sendLoginOtp(): void {
    this.errorMessage = '';

    if (!/^[6-9]\d{9}$/.test(this.mobile)) {
      this.errorMessage = 'Enter a valid 10-digit mobile number.';
      return;
    }

    if (this.otpLoading) {
      return;
    }

    this.otpLoading = true;

    this.authService.sendOtp({
      mobile: this.mobile,
      purpose: 'LOGIN'
    }).pipe(
      finalize(() => {
        this.otpLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.otpSent = true;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message ?? 'Unable to send OTP.';
      }
    });
  }

  verifyLoginOtp(): void {
    this.errorMessage = '';

    if (!/^[6-9]\d{9}$/.test(this.mobile)) {
      this.errorMessage = 'Enter a valid 10-digit mobile number.';
      return;
    }

    if (!/^\d{6}$/.test(this.otp)) {
      this.errorMessage = 'Enter a valid 6-digit OTP.';
      return;
    }

    if (this.otpVerifying) {
      return;
    }

    this.otpVerifying = true;

    this.authService.loginWithOtp({
      mobile: this.mobile,
      otp: this.otp
    }).pipe(
      finalize(() => {
        this.otpVerifying = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message ??
          'OTP verification failed. Please try again.';
      }
    });
  }

}