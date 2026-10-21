import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  BookingRequest,
  BookingResponse,
  MyBookingResponse,
  Booking
} from '../models/booking.model';

import {
  environment
} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/bookings`;


  // =====================================================
  // CREATE BOOKING
  // =====================================================

  createBooking(
    request: BookingRequest
  ): Observable<BookingResponse> {

    return this.http.post<BookingResponse>(
      this.apiUrl,
      request
    );
  }


  // =====================================================
  // GET BOOKING DETAILS
  // =====================================================

  getBookingById(
    bookingId: number
  ): Observable<Booking> {

    return this.http.get<Booking>(
      `${this.apiUrl}/${bookingId}`
    );
  }


  // =====================================================
  // GET MY BOOKINGS
  // =====================================================

  getMyBookings(): Observable<MyBookingResponse[]> {

    return this.http.get<MyBookingResponse[]>(
      `${this.apiUrl}/my-bookings`
    );
  }


  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  cancelBooking(
    bookingId: number
  ): Observable<BookingResponse> {

    return this.http.put<BookingResponse>(
      `${this.apiUrl}/${bookingId}/cancel`,
      {}
    );
  }

}