import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  PaymentService
} from '../../../core/services/payment';

import {
  PaymentMethod,
  PaymentResponse,
  PaymentVerificationRequest
} from '../../../core/models/payment.model';

import {
  environment
} from '../../../../environments/environment';


declare global {

  interface Window {
    Razorpay: any;
  }

}


@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly paymentService =
    inject(PaymentService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // BOOKING
  // =====================================================

  bookingId: number | null = null;


  // =====================================================
  // PAYMENT
  // =====================================================

  payment: PaymentResponse | null = null;

  selectedPaymentMethod: PaymentMethod = 'UPI';

  creatingPayment = false;

  processingPayment = false;

  paymentSuccess = false;


  // =====================================================
  // MESSAGES
  // =====================================================

  errorMessage = '';

  successMessage = '';


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.bookingId =
        params['bookingId']
          ? Number(params['bookingId'])
          : null;


      console.log(
        'PAYMENT BOOKING ID:',
        this.bookingId
      );


      if (!this.bookingId) {

        this.errorMessage =
          'Booking information is missing.';

        this.cdr.detectChanges();

      }

    });

  }


  // =====================================================
  // SELECT PAYMENT METHOD
  // =====================================================

  selectPaymentMethod(
    method: PaymentMethod
  ): void {

    if (
      this.processingPayment ||
      this.creatingPayment
    ) {

      return;

    }

    this.selectedPaymentMethod =
      method;

  }


  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  proceedToPayment(): void {

    this.errorMessage = '';

    this.successMessage = '';


    // -----------------------------------------------------
    // BOOKING ID CHECK
    // -----------------------------------------------------

    if (!this.bookingId) {

      this.errorMessage =
        'Booking information is missing.';

      this.cdr.detectChanges();

      return;

    }


    // -----------------------------------------------------
    // PREVENT DOUBLE CLICK
    // -----------------------------------------------------

    if (
      this.creatingPayment ||
      this.processingPayment
    ) {

      return;

    }


    this.creatingPayment = true;


    const request = {

      bookingId:
        this.bookingId,

      paymentMethod:
        this.selectedPaymentMethod

    };


    console.log(
      'CREATE PAYMENT REQUEST:',
      request
    );


    // -----------------------------------------------------
    // CREATE PAYMENT
    // -----------------------------------------------------

    this.paymentService
      .createPayment(request)
      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (response: PaymentResponse) => {

          console.log(
            'PAYMENT CREATE RESPONSE:',
            response
          );


          this.payment =
            response;


          this.creatingPayment =
            false;


          this.cdr.detectChanges();


          // Open Razorpay
          this.openRazorpayCheckout(
            response
          );

        },


        // =============================================
        // ERROR
        // =============================================

        error: (error) => {

          console.error(
            'CREATE PAYMENT ERROR:',
            error
          );


          this.creatingPayment =
            false;


          this.errorMessage =
            error?.error?.message ??
            'Unable to create payment. Please try again.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // RAZORPAY CHECKOUT
  // =====================================================

  private openRazorpayCheckout(
    payment: PaymentResponse
  ): void {


    // -----------------------------------------------------
    // RAZORPAY SCRIPT CHECK
    // -----------------------------------------------------

    if (!window.Razorpay) {

      this.errorMessage =
        'Razorpay checkout is not loaded.';

      this.cdr.detectChanges();

      return;

    }


    // -----------------------------------------------------
    // RAZORPAY ORDER CHECK
    // -----------------------------------------------------

    if (!payment.razorpayOrderId) {

      this.errorMessage =
        'Razorpay order ID is missing.';

      this.cdr.detectChanges();

      return;

    }


    // -----------------------------------------------------
    // KEY CHECK
    // -----------------------------------------------------

    if (!environment.razorpayKeyId) {

      this.errorMessage =
        'Razorpay key is not configured.';

      this.cdr.detectChanges();

      return;

    }


    this.processingPayment =
      true;


    // =====================================================
    // RAZORPAY OPTIONS
    // =====================================================

    const options = {

      key:
        environment.razorpayKeyId,


      amount:
        Math.round(
          Number(payment.amount) * 100
        ),


      currency:
        'INR',


      name:
        'Train Booking',


      description:
        `Booking #${payment.bookingId}`,


      order_id:
        payment.razorpayOrderId,


      // ===================================================
      // PAYMENT SUCCESS
      // ===================================================

      handler: (response: any) => {

        console.log(
          'RAZORPAY SUCCESS:',
          response
        );


        this.verifyRazorpayPayment(
          response
        );

      },


      // ===================================================
      // MODAL
      // ===================================================

      modal: {

        ondismiss: () => {

          console.log(
            'RAZORPAY CHECKOUT CLOSED'
          );


          this.processingPayment =
            false;


          this.errorMessage =
            'Payment was cancelled.';


          this.cdr.detectChanges();

        }

      }

    };


    try {

      // ===================================================
      // CREATE RAZORPAY INSTANCE
      // ===================================================

      const razorpay =
        new window.Razorpay(options);


      // ===================================================
      // PAYMENT FAILED
      // ===================================================

      razorpay.on(
        'payment.failed',
        (response: any) => {

          console.error(
            'RAZORPAY PAYMENT FAILED:',
            response
          );


          this.processingPayment =
            false;


          this.errorMessage =
            response?.error?.description ??
            'Payment failed.';


          this.cdr.detectChanges();

        }
      );


      // ===================================================
      // OPEN CHECKOUT
      // ===================================================

      razorpay.open();

    } catch (error) {

      console.error(
        'RAZORPAY INITIALIZATION ERROR:',
        error
      );


      this.processingPayment =
        false;


      this.errorMessage =
        'Unable to open Razorpay checkout.';


      this.cdr.detectChanges();

    }

  }


  // =====================================================
  // VERIFY RAZORPAY PAYMENT
  // =====================================================

  private verifyRazorpayPayment(
    razorpayResponse: any
  ): void {


    // -----------------------------------------------------
    // PAYMENT OBJECT CHECK
    // -----------------------------------------------------

    if (!this.payment) {

      this.errorMessage =
        'Payment information is missing.';

      this.processingPayment =
        false;

      this.cdr.detectChanges();

      return;

    }


    // -----------------------------------------------------
    // RAZORPAY RESPONSE VALIDATION
    // -----------------------------------------------------

    if (
      !razorpayResponse?.razorpay_order_id ||
      !razorpayResponse?.razorpay_payment_id ||
      !razorpayResponse?.razorpay_signature
    ) {

      console.error(
        'INVALID RAZORPAY RESPONSE:',
        razorpayResponse
      );


      this.processingPayment =
        false;


      this.errorMessage =
        'Invalid Razorpay payment response.';


      this.cdr.detectChanges();

      return;

    }


    // =====================================================
    // VERIFICATION REQUEST
    // =====================================================

    const request:
      PaymentVerificationRequest = {

      razorpayOrderId:
        razorpayResponse.razorpay_order_id,

      razorpayPaymentId:
        razorpayResponse.razorpay_payment_id,

      razorpaySignature:
        razorpayResponse.razorpay_signature

    };


    console.log(
      'VERIFY PAYMENT REQUEST:',
      request
    );


    // =====================================================
    // VERIFY PAYMENT
    // =====================================================

    this.paymentService
      .verifyPayment(request)
      .subscribe({

        // =============================================
        // VERIFIED SUCCESSFULLY
        // =============================================

        next: (response: PaymentResponse) => {

          console.log(
            'PAYMENT VERIFIED:',
            response
          );


          // Save verified payment
          this.payment =
            response;


          this.processingPayment =
            false;


          this.paymentSuccess =
            true;


          this.successMessage =
            'Payment successful. Booking confirmed.';


          this.cdr.detectChanges();


          // =============================================
          // GO TO CONFIRMATION PAGE
          // =============================================

          setTimeout(() => {

            this.router.navigate(
              ['/booking-confirmation'],
              {
                queryParams: {
                  bookingId:
                    response.bookingId
                }
              }
            );

          }, 800);

        },


        // =============================================
        // VERIFICATION ERROR
        // =============================================

        error: (error) => {

          console.error(
            'PAYMENT VERIFY ERROR:',
            error
          );


          this.processingPayment =
            false;


          this.errorMessage =
            error?.error?.message ??
            'Payment verification failed.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // MY BOOKINGS
  // =====================================================

  goToMyBookings(): void {

    this.router.navigate(
      ['/my-bookings']
    );

  }


  // =====================================================
  // HOME
  // =====================================================

  goHome(): void {

    this.router.navigate(
      ['/']
    );

  }

}