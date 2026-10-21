import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface SeatAvailability {
  seatId: number;
  seatNumber: string;
  seatType: string;
  booked: boolean;
}

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-selection.html',
  styleUrl: './seat-selection.scss'
})
export class SeatSelection implements OnChanges {

  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly apiUrl =
    `${environment.apiUrl}/seats`;

  @Input() coachId: number | null = null;

  @Input() journeyDate: string = '';

  @Input() selectedSeatId: number | null = null;

  @Output() seatSelected =
    new EventEmitter<SeatAvailability>();

  seats: SeatAvailability[] = [];

  loading = false;

  errorMessage = '';

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['coachId'] ||
      changes['journeyDate']
    ) {
      this.loadSeats();
    }

    if (changes['selectedSeatId']) {
      this.cdr.detectChanges();
    }
  }

  // =====================================================
  // LOAD SEATS
  // =====================================================

  loadSeats(): void {

    this.seats = [];

    this.errorMessage = '';

    if (!this.coachId || !this.journeyDate) {
      return;
    }

    this.loading = true;

    this.http
      .get<SeatAvailability[]>(
        `${this.apiUrl}/coach/${this.coachId}/availability`,
        {
          params: {
            journeyDate: this.journeyDate
          }
        }
      )
      .subscribe({

        next: response => {

          this.seats = response ?? [];

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: error => {

          console.error(
            'SEAT AVAILABILITY ERROR:',
            error
          );

          this.loading = false;

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

  selectSeat(seat: SeatAvailability): void {

    if (seat.booked) {
      return;
    }

    this.selectedSeatId = seat.seatId;

    this.seatSelected.emit(seat);

    this.cdr.detectChanges();
  }

  // =====================================================
  // SEAT STATUS
  // =====================================================

  isSelected(seat: SeatAvailability): boolean {

    return this.selectedSeatId === seat.seatId;
  }

  // =====================================================
  // REFRESH
  // =====================================================

  refresh(): void {

    this.loadSeats();
  }

  // =====================================================
  // AVAILABLE COUNT
  // =====================================================

  get availableSeats(): number {

    return this.seats.filter(
      seat => !seat.booked
    ).length;
  }

  // =====================================================
  // BOOKED COUNT
  // =====================================================

  get bookedSeats(): number {

    return this.seats.filter(
      seat => seat.booked
    ).length;
  }
}