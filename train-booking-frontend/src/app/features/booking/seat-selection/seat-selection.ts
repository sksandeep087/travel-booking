import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SeatService } from '../../../core/services/seat.service';
import { SeatAvailability } from '../../../core/models/seat.model';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-selection.html',
  styleUrl: './seat-selection.scss'
})
export class SeatSelection implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seatService = inject(SeatService);
  private readonly cdr = inject(ChangeDetectorRef);

  trainId: number | null = null;
  coachId: number | null = null;
  sourceStationId: number | null = null;
  destinationStationId: number | null = null;

  journeyDate = '';

  seats: SeatAvailability[] = [];
  selectedSeat: SeatAvailability | null = null;

  loadingSeats = false;
  errorMessage = '';


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.trainId = params['trainId']
        ? Number(params['trainId'])
        : null;

      this.coachId = params['coachId']
        ? Number(params['coachId'])
        : null;

      this.sourceStationId = params['sourceStationId']
        ? Number(params['sourceStationId'])
        : null;

      this.destinationStationId = params['destinationStationId']
        ? Number(params['destinationStationId'])
        : null;

      this.journeyDate = params['journeyDate'] ?? '';


      // -----------------------------------------------
      // VALIDATE COACH
      // -----------------------------------------------

      if (!this.coachId) {

        this.loadingSeats = false;

        this.errorMessage =
          'Coach information is missing.';

        this.cdr.detectChanges();

        return;
      }


      // -----------------------------------------------
      // VALIDATE JOURNEY DATE
      // -----------------------------------------------

      if (!this.journeyDate) {

        this.loadingSeats = false;

        this.errorMessage =
          'Journey date is missing.';

        this.cdr.detectChanges();

        return;
      }


      // -----------------------------------------------
      // LOAD SEATS
      // -----------------------------------------------

      this.loadSeats(
        this.coachId,
        this.journeyDate
      );

    });

  }


  // =====================================================
  // LOAD SEAT AVAILABILITY
  // =====================================================

  loadSeats(
    coachId: number,
    journeyDate: string
  ): void {

    this.loadingSeats = true;

    this.errorMessage = '';

    this.seats = [];

    this.selectedSeat = null;

    this.cdr.detectChanges();


    this.seatService
      .getSeatAvailability(
        coachId,
        journeyDate
      )
      .subscribe({

        next: (response: SeatAvailability[]) => {

          console.log(
            'Seat Availability Response:',
            response
          );


          this.seats =
            Array.isArray(response)
              ? response
              : [];


          this.loadingSeats = false;


          if (this.seats.length === 0) {

            this.errorMessage =
              'No seats found for this coach on the selected journey date.';

          }


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Seat Availability API Error:',
            error
          );


          this.seats = [];

          this.selectedSeat = null;

          this.loadingSeats = false;


          this.errorMessage =
            error?.error?.message ??
            'Unable to load seat availability.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SELECT SEAT
  // =====================================================

  selectSeat(
    seat: SeatAvailability
  ): void {

    if (!seat?.seatId) {

      this.errorMessage =
        'Invalid seat selected.';

      this.cdr.detectChanges();

      return;
    }


    // -----------------------------------------------
    // BOOKED SEAT
    // -----------------------------------------------

    if (seat.booked) {

      this.errorMessage =
        `Seat ${seat.seatNumber} is already booked for ${this.formatJourneyDate()}.`;

      this.cdr.detectChanges();

      return;
    }


    // -----------------------------------------------
    // SELECT
    // -----------------------------------------------

    this.selectedSeat = seat;

    this.errorMessage = '';

    this.cdr.detectChanges();

  }


  // =====================================================
  // CHECK SELECTED
  // =====================================================

  isSelected(
    seat: SeatAvailability
  ): boolean {

    return this.selectedSeat?.seatId === seat.seatId;

  }


  // =====================================================
  // CONTINUE BOOKING
  // =====================================================

  continueBooking(): void {

    if (!this.selectedSeat) {

      this.errorMessage =
        'Please select a seat first.';

      this.cdr.detectChanges();

      return;
    }


    this.router.navigate(
      ['/booking'],
      {
        queryParams: {

          trainId: this.trainId,

          coachId: this.coachId,

          // IMPORTANT:
          // Backend availability gives seatId
          seatId: this.selectedSeat.seatId,

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
  // BACK TO COACHES
  // =====================================================

  goBack(): void {

    this.router.navigate(
      ['/coach-selection'],
      {
        queryParams: {

          trainId: this.trainId,

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
  // SEAT TYPE LABEL
  // =====================================================

  getSeatTypeLabel(
    type: string
  ): string {

    switch (type) {

      case 'LOWER':
        return 'Lower Berth';

      case 'MIDDLE':
        return 'Middle Berth';

      case 'UPPER':
        return 'Upper Berth';

      case 'SIDE_LOWER':
        return 'Side Lower';

      case 'SIDE_UPPER':
        return 'Side Upper';

      case 'WINDOW':
        return 'Window';

      case 'AISLE':
        return 'Aisle';

      default:
        return type;

    }

  }


  // =====================================================
  // FORMAT JOURNEY DATE
  // =====================================================

  formatJourneyDate(): string {

    if (!this.journeyDate) {
      return '--';
    }


    const date =
      new Date(
        `${this.journeyDate}T00:00:00`
      );


    if (isNaN(date.getTime())) {
      return this.journeyDate;
    }


    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  }

}