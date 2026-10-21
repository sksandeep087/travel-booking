import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { BookingService } from '../../../core/services/booking';
import { Booking } from '../../../core/models/booking.model';

import QRCode from 'qrcode';

import jsPDF from 'jspdf';


@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.scss'
})
export class BookingConfirmation implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly bookingService = inject(BookingService);

  private readonly cdr = inject(ChangeDetectorRef);


  // =====================================================
  // DATA
  // =====================================================

  bookingId: number | null = null;

  booking: Booking | null = null;

  loading = false;

  errorMessage = '';

  qrCodeDataUrl = '';


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {

      const id = params.get('bookingId');

      this.bookingId = id
        ? Number(id)
        : null;


      console.log(
        'CONFIRMATION BOOKING ID:',
        this.bookingId
      );


      if (!this.bookingId) {

        this.errorMessage =
          'Booking information is missing.';

        this.cdr.detectChanges();

        return;
      }


      this.loadBooking(this.bookingId);

    });

  }


  // =====================================================
  // LOAD BOOKING
  // =====================================================

  loadBooking(
    bookingId: number
  ): void {

    this.loading = true;

    this.errorMessage = '';

    this.booking = null;

    this.qrCodeDataUrl = '';


    this.bookingService
      .getBookingById(bookingId)
      .subscribe({

        next: async (response: Booking) => {

          console.log(
            'BOOKING DETAILS:',
            response
          );


          this.booking = response;

          this.loading = false;


          // Generate QR after booking loaded
          await this.generateQrCode();


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'BOOKING DETAILS ERROR:',
            error
          );


          this.loading = false;

          this.booking = null;

          this.qrCodeDataUrl = '';


          this.errorMessage =
            error?.error?.message ??
            'Unable to load booking details.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // GENERATE QR CODE
  // =====================================================

  async generateQrCode(): Promise<void> {

    if (!this.booking) {

      return;

    }


    const qrData = JSON.stringify({

      bookingId:
        this.booking.bookingId,

      bookingNumber:
        this.booking.bookingNumber,

      trainNumber:
        this.booking.train.trainNumber,

      journeyDate:
        this.booking.journeyDate,

      coachNumber:
        this.booking.seat.coach.coachNumber,

      seatNumber:
        this.booking.seat.seatNumber,

      status:
        this.booking.bookingStatus

    });


    try {

      this.qrCodeDataUrl =
        await QRCode.toDataURL(
          qrData,
          {
            width: 180,
            margin: 2,
            errorCorrectionLevel: 'M'
          }
        );


      console.log(
        'QR CODE GENERATED'
      );

    } catch (error) {

      console.error(
        'QR CODE GENERATION ERROR:',
        error
      );

      this.qrCodeDataUrl = '';

    }

  }


  // =====================================================
  // BOOKING STATUS
  // =====================================================

  isConfirmed(): boolean {

    return (
      this.booking?.bookingStatus ===
      'CONFIRMED'
    );

  }


  isCancelled(): boolean {

    return (
      this.booking?.bookingStatus ===
      'CANCELLED'
    );

  }


  isPending(): boolean {

    return (
      this.booking?.bookingStatus ===
      'PENDING'
    );

  }


  // =====================================================
  // STATUS CSS
  // =====================================================

  getStatusClass(): string {

    switch (
    this.booking?.bookingStatus
    ) {

      case 'CONFIRMED':
        return 'status-confirmed';

      case 'CANCELLED':
        return 'status-cancelled';

      case 'PENDING':
        return 'status-pending';

      default:
        return '';

    }

  }


  // =====================================================
  // STATUS ICON
  // =====================================================

  getStatusIcon(): string {

    switch (
    this.booking?.bookingStatus
    ) {

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


  // =====================================================
  // HEADER TITLE
  // =====================================================

  getHeaderTitle(): string {

    switch (
    this.booking?.bookingStatus
    ) {

      case 'CONFIRMED':
        return 'Booking Confirmed';

      case 'CANCELLED':
        return 'Booking Cancelled';

      case 'PENDING':
        return 'Booking Pending';

      default:
        return 'Booking Details';

    }

  }


  // =====================================================
  // HEADER MESSAGE
  // =====================================================

  getHeaderMessage(): string {

    switch (
    this.booking?.bookingStatus
    ) {

      case 'CONFIRMED':
        return 'Your train ticket has been booked successfully.';

      case 'CANCELLED':
        return 'This booking has been cancelled.';

      case 'PENDING':
        return 'Payment for this booking is still pending.';

      default:
        return 'View your booking details below.';

    }

  }


  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  getPaymentStatus(): string {

    return (
      this.booking?.payment?.paymentStatus ??
      'N/A'
    );

  }


  // =====================================================
  // PAYMENT STATUS CSS
  // =====================================================

  getPaymentStatusClass(): string {

    const paymentStatus =
      this.booking?.payment?.paymentStatus;


    switch (paymentStatus) {

      case 'SUCCESS':
        return 'payment-success';

      case 'REFUNDED':
        return 'payment-refunded';

      case 'FAILED':
        return 'payment-failed';

      case 'PENDING':
        return 'payment-pending';

      default:
        return '';

    }

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date: string | null | undefined
  ): string {

    if (!date) {

      return '--';

    }


    const value = new Date(date);


    if (
      isNaN(
        value.getTime()
      )
    ) {

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


  // =====================================================
  // FORMAT TIME
  // =====================================================

  formatTime(
    time: string | null | undefined
  ): string {

    if (!time) {

      return '--:--';

    }


    const value = new Date(time);


    if (
      !isNaN(
        value.getTime()
      )
    ) {

      return value.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      );

    }


    return time.length >= 5
      ? time.substring(0, 5)
      : time;

  }


  // =====================================================
  // PRINT / SAVE PDF
  // =====================================================

  printTicket(): void {

    if (!this.booking) {

      return;

    }


    window.print();

  }


  // =====================================================
  // HOME
  // =====================================================

  goHome(): void {

    this.router.navigate(['/']);

  }


  // =====================================================
  // MY BOOKINGS
  // =====================================================

  goToMyBookings(): void {

    this.router.navigate([
      '/my-bookings'
    ]);

  }

  downloadTicketPdf(): void {
    if (!this.booking) {
      return;
    }

    const booking = this.booking;

    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(8, 117, 225);
    doc.rect(0, 0, pageWidth, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TRAIN BOOKING', 15, 14);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Electronic Train Ticket', 15, 22);

    // Booking status
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      booking.bookingStatus,
      pageWidth - 15,
      17,
      { align: 'right' }
    );

    // Booking information
    let y = 45;

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Details', 15, y);

    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text('Booking Number:', 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.bookingNumber, 60, y);

    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.text('Booking Date:', 15, y);
    doc.text(this.formatDate(booking.bookingDate), 60, y);

    y += 7;

    doc.text('Journey Date:', 15, y);
    doc.text(this.formatDate(booking.journeyDate), 60, y);

    // Train details
    y += 15;

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('Train Details', 15, y);

    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text('Train Number:', 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.train.trainNumber, 60, y);

    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.text('Train Name:', 15, y);
    doc.text(booking.train.trainName, 60, y);

    y += 7;

    doc.text('From:', 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${booking.train.sourceStation.stationName} (${booking.train.sourceStation.stationCode})`,
      60,
      y
    );

    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.text('To:', 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${booking.train.destinationStation.stationName} (${booking.train.destinationStation.stationCode})`,
      60,
      y
    );

    // Seat details
    y += 15;

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('Passenger / Seat Details', 15, y);

    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text('Coach:', 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.seat.coach.coachNumber, 60, y);

    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.text('Coach Type:', 15, y);
    doc.text(booking.seat.coach.coachType, 60, y);

    y += 7;

    doc.text('Seat Number:', 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.seat.seatNumber, 60, y);

    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.text('Seat Type:', 15, y);
    doc.text(booking.seat.seatType ?? '--', 60, y);

    // Payment
    y += 15;

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details', 15, y);

    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text('Payment Status:', 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(
      booking.payment?.paymentStatus ?? 'N/A',
      60,
      y
    );

    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.text('Payment Method:', 15, y);
    doc.text(
      booking.payment?.paymentMethod ?? '--',
      60,
      y
    );

    y += 7;

    doc.text('Amount:', 15, y);
    doc.setFont('helvetica', 'bold');
    doc.text(
      booking.payment?.amount != null
        ? `Rs. ${booking.payment.amount}`
        : '--',
      60,
      y
    );

    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.text('Transaction ID:', 15, y);
    doc.text(
      booking.payment?.transactionId ?? '--',
      60,
      y
    );

    // Footer
    const footerY = 285;

    doc.setDrawColor(220, 225, 230);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    doc.text(
      'Generated from Train Booking System',
      15,
      footerY
    );

    doc.text(
      `Booking ID: ${booking.bookingId}`,
      pageWidth - 15,
      footerY,
      { align: 'right' }
    );

    const fileName =
      `Train-Ticket-${booking.bookingNumber}.pdf`;

    doc.save(fileName);
  }

}