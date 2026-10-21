import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../../../environments/environment';

import Swal from 'sweetalert2';


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

  selector: 'app-manage-bookings',

  standalone: true,

 imports: [
  CommonModule,
  FormsModule
],

  templateUrl: './manage-bookings.html',

  styleUrl: './manage-bookings.scss'
})
export class ManageBookings implements OnInit {

  private readonly http =
    inject(HttpClient);

  private readonly router =
    inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);


  private readonly apiUrl =
    `${environment.apiUrl}/admin/bookings`;


  bookings: AdminBooking[] = [];

  filteredBookings: AdminBooking[] = [];


  loading = false;

  errorMessage = '';


  searchText = '';

  selectedStatus = 'ALL';


  ngOnInit(): void {

    this.loadBookings();

  }


  loadBookings(): void {

    this.loading = true;

    this.errorMessage = '';


    const token =
      localStorage.getItem('token');


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    this.http
      .get<AdminBooking[]>(
        this.apiUrl,
        { headers }
      )
      .subscribe({

        next: (response) => {

          console.log(
            'ADMIN BOOKINGS:',
            response
          );


          this.bookings =
            response ?? [];


          this.applyFilters();


          this.loading = false;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'ADMIN BOOKINGS ERROR:',
            error
          );


          this.loading = false;


          if (error?.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }
          else if (error?.status === 403) {

            this.errorMessage =
              'Access denied. Admin permission required.';

          }
          else {

            this.errorMessage =
              error?.error?.message ??
              'Unable to load bookings.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredBookings =
      this.bookings.filter(
        booking => {

          const matchesSearch =
            !search ||

            booking.bookingNumber
              ?.toLowerCase()
              .includes(search) ||

            booking.userName
              ?.toLowerCase()
              .includes(search) ||

            booking.userEmail
              ?.toLowerCase()
              .includes(search) ||

            booking.trainNumber
              ?.toLowerCase()
              .includes(search) ||

            booking.trainName
              ?.toLowerCase()
              .includes(search) ||

            booking.seatNumber
              ?.toLowerCase()
              .includes(search);


          const matchesStatus =
            this.selectedStatus === 'ALL' ||

            booking.bookingStatus ===
              this.selectedStatus;


          return matchesSearch &&
                 matchesStatus;

        }
      );

  }


  onSearch(): void {

    this.applyFilters();

  }


  onStatusChange(): void {

    this.applyFilters();

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = 'ALL';

    this.applyFilters();

  }


  refresh(): void {

    this.loadBookings();

  }


  get totalBookings(): number {

    return this.bookings.length;

  }


  get confirmedBookings(): number {

    return this.bookings.filter(
      booking =>
        booking.bookingStatus === 'CONFIRMED'
    ).length;

  }


  get pendingBookings(): number {

    return this.bookings.filter(
      booking =>
        booking.bookingStatus === 'PENDING'
    ).length;

  }


  get cancelledBookings(): number {

    return this.bookings.filter(
      booking =>
        booking.bookingStatus === 'CANCELLED'
    ).length;

  }


  viewBooking(
    booking: AdminBooking
  ): void {

    this.router.navigate([
      '/admin/bookings',
      booking.bookingId
    ]);

  }


  goBack(): void {

    this.router.navigate([
      '/admin/dashboard'
    ]);

  }


  getBookingStatusClass(
    status: string
  ): string {

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


  trackByBookingId(
    index: number,
    booking: AdminBooking
  ): number {

    return booking.bookingId;

  }

}