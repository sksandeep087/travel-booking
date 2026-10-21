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

import {
  BookingService
} from '../../../core/services/booking';

import {
  StationService
} from '../../../core/services/station';

import {
  BookingRequest,
  BookingResponse,
  Booking
} from '../../../core/models/booking.model';

import {
  Station
} from '../../../core/models/station.model';


@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './booking.html',
  styleUrl: './booking.scss'
})
export class BookingPage implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly bookingService =
    inject(BookingService);

  private readonly stationService =
    inject(StationService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // BOOKING DATA
  // =====================================================

  trainId: number | null = null;

  coachId: number | null = null;

  seatId: number | null = null;

  sourceStationId: number | null = null;

  destinationStationId: number | null = null;

  journeyDate = '';


  // =====================================================
  // STATIONS
  // =====================================================

  stations: Station[] = [];

  sourceStation: Station | null = null;

  destinationStation: Station | null = null;


  // =====================================================
  // RESPONSE DATA
  // =====================================================

  bookingResponse: BookingResponse | null = null;

  bookingDetails: Booking | null = null;


  // =====================================================
  // FLAGS
  // =====================================================

  creatingBooking = false;

  loadingDetails = false;

  loadingStations = false;


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

      this.trainId =
        params['trainId']
          ? Number(params['trainId'])
          : null;

      this.coachId =
        params['coachId']
          ? Number(params['coachId'])
          : null;

      this.seatId =
        params['seatId']
          ? Number(params['seatId'])
          : null;

      this.sourceStationId =
        params['sourceStationId']
          ? Number(params['sourceStationId'])
          : null;

      this.destinationStationId =
        params['destinationStationId']
          ? Number(params['destinationStationId'])
          : null;

      this.journeyDate =
        params['journeyDate'] ?? '';


      this.validateBookingData();

      this.loadStations();

    });

  }


  // =====================================================
  // VALIDATE BOOKING DATA
  // =====================================================

  private validateBookingData(): void {

    this.errorMessage = '';


    if (!this.trainId) {

      this.errorMessage =
        'Train information is missing.';

      return;
    }


    if (!this.coachId) {

      this.errorMessage =
        'Coach information is missing.';

      return;
    }


    if (!this.seatId) {

      this.errorMessage =
        'Seat information is missing.';

      return;
    }


    if (!this.journeyDate) {

      this.errorMessage =
        'Journey date is missing.';

      return;
    }


    this.cdr.detectChanges();

  }


  // =====================================================
  // LOAD STATIONS
  // =====================================================

  private loadStations(): void {

    this.loadingStations = true;

    this.stationService
      .getAllStations()
      .subscribe({

        next: (response: Station[]) => {

          console.log(
            'BOOKING STATIONS:',
            response
          );


          this.stations =
            response ?? [];


          this.sourceStation =
            this.stations.find(
              station =>
                station.id === this.sourceStationId
            ) ?? null;


          this.destinationStation =
            this.stations.find(
              station =>
                station.id === this.destinationStationId
            ) ?? null;


          console.log(
            'SOURCE STATION:',
            this.sourceStation
          );

          console.log(
            'DESTINATION STATION:',
            this.destinationStation
          );


          this.loadingStations = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'BOOKING STATION API ERROR:',
            error
          );


          this.stations = [];

          this.sourceStation = null;

          this.destinationStation = null;

          this.loadingStations = false;


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // CREATE BOOKING
  // =====================================================

  createBooking(): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (!this.trainId) {

      this.errorMessage =
        'Train information is missing.';

      return;
    }


    if (!this.seatId) {

      this.errorMessage =
        'Seat information is missing.';

      return;
    }


    if (!this.journeyDate) {

      this.errorMessage =
        'Journey date is missing.';

      return;
    }


    if (this.creatingBooking) {

      return;
    }


    this.creatingBooking = true;

    this.cdr.detectChanges();


    const request: BookingRequest = {

      trainId: this.trainId,

      seatId: this.seatId,

      journeyDate: this.journeyDate

    };


    this.bookingService
      .createBooking(request)
      .subscribe({

        next: (response: BookingResponse) => {

          console.log(
            'BOOKING CREATED:',
            response
          );


          this.bookingResponse =
            response;


          this.successMessage =
            response.message ??
            'Booking created successfully.';


          this.loadBookingDetails(
            response.bookingId
          );

        },


        error: (error) => {

          console.error(
            'BOOKING API ERROR:',
            error
          );


          this.bookingResponse = null;

          this.bookingDetails = null;

          this.creatingBooking = false;


          this.errorMessage =
            error?.error?.message ??
            'Unable to create booking. Please try again.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD BOOKING DETAILS
  // =====================================================

  private loadBookingDetails(
    bookingId: number
  ): void {

    this.loadingDetails = true;


    this.bookingService
      .getBookingById(bookingId)
      .subscribe({

        next: (response: Booking) => {

          console.log(
            'BOOKING DETAILS:',
            response
          );


          this.bookingDetails =
            response;


          this.creatingBooking = false;

          this.loadingDetails = false;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'BOOKING DETAILS API ERROR:',
            error
          );


          this.creatingBooking = false;

          this.loadingDetails = false;


          this.errorMessage =
            error?.error?.message ??
            'Booking created, but booking details could not be loaded.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // PROCEED TO PAYMENT
  // =====================================================

  proceedToPayment(): void {

    const bookingId =
      this.bookingResponse?.bookingId;


    if (!bookingId) {

      this.errorMessage =
        'Booking is not created yet.';

      this.cdr.detectChanges();

      return;
    }


    this.router.navigate(
      ['/payment'],
      {
        queryParams: {
          bookingId: bookingId
        }
      }
    );

  }


  // =====================================================
  // BACK TO SEATS
  // =====================================================

  goBack(): void {

    this.router.navigate(
      ['/seat-selection'],
      {
        queryParams: {

          trainId: this.trainId,

          coachId: this.coachId,

          sourceStationId:
            this.sourceStationId,

          destinationStationId:
            this.destinationStationId,

          journeyDate:
            this.journeyDate

        }
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


    const date =
      new Date(time);


    if (!isNaN(date.getTime())) {

      return date.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      );

    }


    return time.substring(0, 5);

  }

}