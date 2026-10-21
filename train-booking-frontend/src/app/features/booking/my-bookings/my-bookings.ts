import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { BookingService } from '../../../core/services/booking';

import {
  MyBookingResponse
} from '../../../core/models/booking.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss'
})
export class MyBookings implements OnInit {

  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  /* =====================================================
     DATA
     ===================================================== */

  bookings: MyBookingResponse[] = [];

  filteredBookings: MyBookingResponse[] = [];

  /* =====================================================
     UI STATE
     ===================================================== */

  loading = false;

  errorMessage = '';

  cancellingBookingId: number | null = null;

  activeFilter = 'ALL';


  /* =====================================================
     LIFECYCLE
     ===================================================== */

  ngOnInit(): void {
    this.loadBookings();
  }


  /* =====================================================
     LOAD BOOKINGS
     ===================================================== */

  loadBookings(): void {

    this.loading = true;

    this.errorMessage = '';

    this.bookingService.getMyBookings().subscribe({

      next: (response: MyBookingResponse[]) => {

        this.bookings = response ?? [];

        this.applyFilter();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'MY BOOKINGS ERROR:',
          error
        );

        this.loading = false;

        this.bookings = [];

        this.filteredBookings = [];

        this.errorMessage =
          error?.error?.message ??
          'Unable to load your bookings.';

        this.cdr.detectChanges();
      }

    });
  }


  /* =====================================================
     FILTER
     ===================================================== */

  setFilter(filter: string): void {

    this.activeFilter = filter;

    this.applyFilter();
  }


  applyFilter(): void {

    if (this.activeFilter === 'ALL') {

      this.filteredBookings = [
        ...this.bookings
      ];

      return;
    }

    this.filteredBookings =
      this.bookings.filter(
        booking =>
          booking.bookingStatus ===
          this.activeFilter
      );
  }


  getFilterCount(filter: string): number {

    if (filter === 'ALL') {

      return this.bookings.length;
    }

    return this.bookings.filter(
      booking =>
        booking.bookingStatus === filter
    ).length;
  }


  /* =====================================================
     FILTER EMPTY MESSAGE
     ===================================================== */

  getFilterTitle(): string {

    switch (this.activeFilter) {

      case 'CONFIRMED':
        return 'No Confirmed Bookings';

      case 'PENDING':
        return 'No Pending Bookings';

      case 'CANCELLED':
        return 'No Cancelled Bookings';

      default:
        return 'No Bookings Found';
    }
  }


  getFilterMessage(): string {

    switch (this.activeFilter) {

      case 'CONFIRMED':
        return 'You do not have any confirmed bookings.';

      case 'PENDING':
        return 'You do not have any pending bookings.';

      case 'CANCELLED':
        return 'You do not have any cancelled bookings.';

      default:
        return 'You do not have any train bookings yet.';
    }
  }


  /* =====================================================
     VIEW TICKET
     ===================================================== */

  viewTicket(bookingId: number): void {

    if (!bookingId) {
      return;
    }

    this.router.navigate(
      ['/booking-confirmation'],
      {
        queryParams: {
          bookingId
        }
      }
    );
  }


  /* =====================================================
     CANCEL BOOKING
     ===================================================== */

  cancelBooking(
    booking: MyBookingResponse
  ): void {

    if (!booking?.bookingId) {
      return;
    }

    if (!this.canCancel(booking)) {
      return;
    }


    Swal.fire({

      title: 'Cancel Booking?',

      html: `
        <div style="
          font-size:14px;
          color:#64748b;
          line-height:1.7;
        ">
          Are you sure you want to cancel
          booking
          <strong style="color:#102a56;">
            #${booking.bookingId}
          </strong>?
          <br>

          <span style="
            font-size:12px;
            color:#94a3b8;
          ">
            ${booking.trainName}
            (${booking.trainNumber})
          </span>
        </div>
      `,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText:
        '<i class="bi bi-x-circle"></i> Yes, Cancel',

      cancelButtonText:
        'Keep Booking',

      confirmButtonColor:
        '#dc3545',

      cancelButtonColor:
        '#64748b',

      reverseButtons: true,

      focusCancel: true,

      allowOutsideClick: false,

      customClass: {

        popup:
          'booking-cancel-popup',

        title:
          'booking-cancel-title',

        confirmButton:
          'booking-confirm-btn',

        cancelButton:
          'booking-cancel-btn'
      }

    }).then((result) => {

      if (!result.isConfirmed) {
        return;
      }

      this.performCancellation(
        booking
      );

    });
  }


  /* =====================================================
     ACTUAL CANCEL API
     ===================================================== */

  private performCancellation(
    booking: MyBookingResponse
  ): void {

    this.cancellingBookingId = booking.bookingId;

    this.cdr.detectChanges();

    this.bookingService
      .cancelBooking(booking.bookingId)
      .subscribe({

        next: (response) => {

          console.log(
            'BOOKING CANCEL RESPONSE:',
            response
          );

          this.cancellingBookingId = null;

          /*
           * Refresh immediately after successful cancellation.
           *
           * Backend will return the latest:
           * bookingStatus = CANCELLED
           * paymentStatus = REFUNDED / PENDING / etc.
           */
          this.loadBookings();

          Swal.fire({

            icon: 'success',

            title: 'Booking Cancelled',

            html: `
            <div style="
              font-size:14px;
              color:#64748b;
              line-height:1.6;
            ">
              Booking
              <strong>
                #${booking.bookingId}
              </strong>
              has been cancelled successfully.
            </div>
          `,

            confirmButtonText: 'OK',

            confirmButtonColor: '#0875e1',

            timer: 2000,

            timerProgressBar: true,

            customClass: {
              popup: 'booking-success-popup'
            }

          });

        },

        error: (error) => {

          console.error(
            'BOOKING CANCEL ERROR:',
            error
          );

          this.cancellingBookingId = null;

          this.cdr.detectChanges();

          Swal.fire({

            icon: 'error',

            title: 'Cancellation Failed',

            text:
              error?.error?.message ??
              'Unable to cancel booking. Please try again.',

            confirmButtonText: 'OK',

            confirmButtonColor: '#0875e1'

          });

        }

      });
  }


  /* =====================================================
     CAN CANCEL
     ===================================================== */

  canCancel(
    booking: MyBookingResponse
  ): boolean {

    if (!booking) {
      return false;
    }

    return (
      booking.bookingStatus ===
      'CONFIRMED' ||

      booking.bookingStatus ===
      'PENDING'
    );
  }


  /* =====================================================
     STATUS CHECK
     ===================================================== */

  isCancelled(
    booking: MyBookingResponse
  ): boolean {

    return (
      booking?.bookingStatus ===
      'CANCELLED'
    );
  }


  isConfirmed(
    booking: MyBookingResponse
  ): boolean {

    return (
      booking?.bookingStatus ===
      'CONFIRMED'
    );
  }


  isPending(
    booking: MyBookingResponse
  ): boolean {

    return (
      booking?.bookingStatus ===
      'PENDING'
    );
  }


  /* =====================================================
     BOOKING STATUS CLASS
     ===================================================== */

  getBookingStatusClass(
    status: string
  ): string {

    switch (status) {

      case 'CONFIRMED':
        return 'status-confirmed';

      case 'CANCELLED':
        return 'status-cancelled';

      case 'PENDING':
        return 'status-pending';

      default:
        return 'status-default';
    }
  }


  /* =====================================================
     BOOKING STATUS ICON
     ===================================================== */

  getBookingStatusIcon(
    status: string
  ): string {

    switch (status) {

      case 'CONFIRMED':
        return 'bi-check-circle-fill';

      case 'CANCELLED':
        return 'bi-x-circle-fill';

      case 'PENDING':
        return 'bi-clock-fill';

      default:
        return 'bi-info-circle-fill';
    }
  }


  /* =====================================================
     PAYMENT STATUS CLASS
     ===================================================== */

  getPaymentStatusClass(
    status: string | null
  ): string {

    switch (status) {

      case 'SUCCESS':
        return 'payment-success';

      case 'REFUNDED':
        return 'payment-refunded';

      case 'FAILED':
        return 'payment-failed';

      case 'PENDING':
        return 'payment-pending';

      default:
        return 'payment-default';
    }
  }


  /* =====================================================
     PAYMENT STATUS ICON
     ===================================================== */

  getPaymentStatusIcon(
    status: string | null
  ): string {

    switch (status) {

      case 'SUCCESS':
        return 'bi-check-circle-fill';

      case 'REFUNDED':
        return 'bi-arrow-counterclockwise';

      case 'FAILED':
        return 'bi-x-circle-fill';

      case 'PENDING':
        return 'bi-clock-fill';

      default:
        return 'bi-info-circle-fill';
    }
  }


  /* =====================================================
     DATE FORMAT
     ===================================================== */

  formatDate(
    date: string | null | undefined
  ): string {

    if (!date) {
      return '--';
    }

    const value = new Date(date);

    if (isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }


  /* =====================================================
     REFRESH
     ===================================================== */

  refresh(): void {

    this.loadBookings();
  }


  /* =====================================================
     HOME
     ===================================================== */

  goHome(): void {

    this.router.navigate(['/']);
  }


  /* =====================================================
     TRACK BY
     ===================================================== */

  trackByBookingId(
    index: number,
    booking: MyBookingResponse
  ): number {

    return booking.bookingId;
  }
}