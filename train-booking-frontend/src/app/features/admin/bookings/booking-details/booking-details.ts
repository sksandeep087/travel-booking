import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '../../../../../environments/environment';

interface AdminBooking {
  bookingId: number;
  bookingNumber: string;
  bookingStatus: string;
  bookingDate: string;
  journeyDate: string;

  userId: number;
  userName: string;
  userEmail: string;
  userMobile: string;

  trainId: number;
  trainNumber: string;
  trainName: string;

  sourceStation: string;
  destinationStation: string;

  seatId: number;
  seatNumber: string;
  coachNumber: string;
  coachType: string;

  paymentId: number | null;
  paymentAmount: number | null;
  paymentMethod: string | null;
  paymentStatus: string | null;

  transactionId: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpayRefundId: string | null;

  paymentCreatedAt: string | null;
  paymentUpdatedAt: string | null;
}

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.scss'
})
export class BookingDetails implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly apiUrl =
    `${environment.apiUrl}/admin/bookings`;

  booking: AdminBooking | null = null;

  loading = false;
  errorMessage = '';

  bookingId!: number;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Booking ID is missing.';
      return;
    }

    this.bookingId = Number(id);

    if (Number.isNaN(this.bookingId)) {
      this.errorMessage = 'Invalid booking ID.';
      return;
    }

    this.loadBooking();
  }

  loadBooking(): void {
    this.loading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<AdminBooking>(
        `${this.apiUrl}/${this.bookingId}`,
        { headers }
      )
      .subscribe({

        next: response => {

          console.log(
            'ADMIN BOOKING DETAILS:',
            response
          );

          this.booking = response;

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: error => {

          console.error(
            'ADMIN BOOKING DETAILS ERROR:',
            error
          );

          this.loading = false;

          if (error?.status === 401) {
            this.errorMessage =
              'Your session has expired. Please login again.';
          } else if (error?.status === 403) {
            this.errorMessage =
              'Access denied. Admin permission required.';
          } else if (error?.status === 404) {
            this.errorMessage =
              'Booking not found.';
          } else {
            this.errorMessage =
              error?.error?.message ??
              'Unable to load booking details.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  refresh(): void {
    this.loadBooking();
  }

  goBack(): void {
    this.router.navigate(['/admin/bookings']);
  }

  getBookingStatusClass(status: string): string {

    switch (status) {

      case 'CONFIRMED':
        return 'confirmed';

      case 'PENDING':
        return 'pending';

      case 'CANCELLED':
        return 'cancelled';

      default:
        return '';
    }
  }

  getPaymentStatusClass(
    status: string | null
  ): string {

    switch (status) {

      case 'SUCCESS':
        return 'success';

      case 'PENDING':
        return 'pending';

      case 'FAILED':
        return 'failed';

      case 'REFUNDED':
        return 'refunded';

      default:
        return 'not-paid';
    }
  }

  formatDate(
    value: string | null | undefined
  ): string {

    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  formatDateTime(
    value: string | null | undefined
  ): string {

    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  formatAmount(
    amount: number | null | undefined
  ): string {

    if (
      amount === null ||
      amount === undefined
    ) {
      return '-';
    }

    return `₹${amount.toFixed(2)}`;
  }
}