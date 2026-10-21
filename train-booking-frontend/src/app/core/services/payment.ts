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
  environment
} from '../../../environments/environment';

import {
  PaymentRequest,
  PaymentResponse,
  PaymentVerificationRequest
} from '../models/payment.model';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly http =
    inject(HttpClient);


  private readonly apiUrl =
    `${environment.apiUrl}/payments`;


  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  createPayment(
    request: PaymentRequest
  ): Observable<PaymentResponse> {

    return this.http.post<PaymentResponse>(
      this.apiUrl,
      request
    );

  }


  // =====================================================
  // VERIFY RAZORPAY PAYMENT
  // =====================================================

  verifyPayment(
    request: PaymentVerificationRequest
  ): Observable<PaymentResponse> {

    return this.http.post<PaymentResponse>(
      `${this.apiUrl}/verify`,
      request
    );

  }


  // =====================================================
  // GET PAYMENT
  // =====================================================

  getPayment(
    paymentId: number
  ): Observable<PaymentResponse> {

    return this.http.get<PaymentResponse>(
      `${this.apiUrl}/${paymentId}`
    );

  }

}