import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import Swal from 'sweetalert2';

interface TrainResponse {
  id: number;
  trainNumber: string;
  trainName: string;
}

interface CoachResponse {
  id: number;
  coachNumber: string;
  coachType: string;
  totalSeats: number;
  train: TrainResponse;
}

interface SeatResponse {
  id: number;
  seatNumber: string;
  seatType: string;
  coach: CoachResponse;
}

interface SeatRequest {
  seatNumber: string;
  seatType: string;
  coachId: number;
}

@Component({
  selector: 'app-manage-seats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './manage-seats.html',
  styleUrl: './manage-seats.scss'
})
export class ManageSeats implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly trainApiUrl =
    `${environment.apiUrl}/trains`;

  private readonly coachApiUrl =
    `${environment.apiUrl}/admin/coaches`;

  private readonly seatApiUrl =
    `${environment.apiUrl}/admin/seats`;

  trains: TrainResponse[] = [];
  coaches: CoachResponse[] = [];
  seats: SeatResponse[] = [];

  selectedTrainId: number | null = null;
  selectedCoachId: number | null = null;

  searchText = '';

  loadingTrains = false;
  loadingCoaches = false;
  loadingSeats = false;

  showModal = false;
  isEditMode = false;

  selectedSeatId: number | null = null;

  seatForm: SeatRequest = {
    seatNumber: '',
    seatType: 'LOWER',
    coachId: 0
  };

  readonly seatTypes = [
    'LOWER',
    'MIDDLE',
    'UPPER',
    'SIDE_LOWER',
    'SIDE_UPPER',
    'WINDOW',
    'AISLE'
  ];

  ngOnInit(): void {
    this.loadTrains();
  }

  // --------------------------------------------------
  // LOAD TRAINS
  // --------------------------------------------------

  loadTrains(): void {

    this.loadingTrains = true;

    this.http.get<TrainResponse[]>(this.trainApiUrl).subscribe({

      next: response => {

        this.trains = response ?? [];

        this.loadingTrains = false;

        this.cdr.detectChanges();
      },

      error: error => {

        console.error('TRAIN LOAD ERROR:', error);

        this.loadingTrains = false;

        Swal.fire({
          icon: 'error',
          title: 'Unable to Load Trains',
          text: error?.error?.message ?? 'Unable to load trains.'
        });

        this.cdr.detectChanges();
      }

    });
  }

  // --------------------------------------------------
  // TRAIN CHANGE
  // --------------------------------------------------

  onTrainChange(): void {

    this.selectedCoachId = null;

    this.coaches = [];
    this.seats = [];

    if (!this.selectedTrainId) {
      return;
    }

    this.loadCoaches(this.selectedTrainId);
  }

  // --------------------------------------------------
  // LOAD COACHES
  // --------------------------------------------------

  loadCoaches(trainId: number): void {

    this.loadingCoaches = true;

    this.http
      .get<CoachResponse[]>(
        `${this.coachApiUrl}/train/${trainId}`
      )
      .subscribe({

        next: response => {

          this.coaches = response ?? [];

          this.loadingCoaches = false;

          this.cdr.detectChanges();
        },

        error: error => {

          console.error('COACH LOAD ERROR:', error);

          this.loadingCoaches = false;

          Swal.fire({
            icon: 'error',
            title: 'Unable to Load Coaches',
            text: error?.error?.message ?? 'Unable to load coaches.'
          });

          this.cdr.detectChanges();
        }

      });
  }

  // --------------------------------------------------
  // COACH CHANGE
  // --------------------------------------------------

  onCoachChange(): void {

    this.seats = [];
    this.searchText = '';

    if (!this.selectedCoachId) {
      return;
    }

    this.loadSeats(this.selectedCoachId);
  }

  // --------------------------------------------------
  // LOAD SEATS
  // --------------------------------------------------

  loadSeats(coachId: number): void {

    this.loadingSeats = true;

    this.http
      .get<SeatResponse[]>(
        `${this.seatApiUrl}/coach/${coachId}`
      )
      .subscribe({

        next: response => {

          this.seats = response ?? [];

          this.loadingSeats = false;

          this.cdr.detectChanges();
        },

        error: error => {

          console.error('SEAT LOAD ERROR:', error);

          this.loadingSeats = false;

          Swal.fire({
            icon: 'error',
            title: 'Unable to Load Seats',
            text: error?.error?.message ?? 'Unable to load seats.'
          });

          this.cdr.detectChanges();
        }

      });
  }

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  get filteredSeats(): SeatResponse[] {

    const search = this.searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return this.seats;
    }

    return this.seats.filter(seat =>
      seat.seatNumber?.toLowerCase().includes(search) ||
      seat.seatType?.toLowerCase().includes(search)
    );
  }

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  get totalSeats(): number {
    return this.seats.length;
  }

  get lowerSeats(): number {
    return this.seats.filter(
      seat => seat.seatType === 'LOWER'
    ).length;
  }

  get middleSeats(): number {
    return this.seats.filter(
      seat => seat.seatType === 'MIDDLE'
    ).length;
  }

  get upperSeats(): number {
    return this.seats.filter(
      seat => seat.seatType === 'UPPER'
    ).length;
  }

  // --------------------------------------------------
  // OPEN ADD MODAL
  // --------------------------------------------------

  openAddModal(): void {

    if (!this.selectedCoachId) {

      Swal.fire({
        icon: 'info',
        title: 'Select Coach',
        text: 'Please select a train and coach first.'
      });

      return;
    }

    this.isEditMode = false;
    this.selectedSeatId = null;

    this.seatForm = {
      seatNumber: '',
      seatType: 'LOWER',
      coachId: this.selectedCoachId
    };

    this.showModal = true;

    this.cdr.detectChanges();
  }

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  openEditModal(seat: SeatResponse): void {

    this.isEditMode = true;

    this.selectedSeatId = seat.id;

    this.seatForm = {
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      coachId: seat.coach?.id ?? this.selectedCoachId ?? 0
    };

    this.showModal = true;

    this.cdr.detectChanges();
  }

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  closeModal(): void {

    this.showModal = false;

    this.selectedSeatId = null;

    this.seatForm = {
      seatNumber: '',
      seatType: 'LOWER',
      coachId: this.selectedCoachId ?? 0
    };

    this.cdr.detectChanges();
  }

  // --------------------------------------------------
  // SAVE SEAT
  // --------------------------------------------------

  saveSeat(): void {

    if (!this.seatForm.seatNumber.trim()) {

      Swal.fire({
        icon: 'warning',
        title: 'Seat Number Required',
        text: 'Please enter seat number.'
      });

      return;
    }

    if (!this.seatForm.seatType) {

      Swal.fire({
        icon: 'warning',
        title: 'Seat Type Required',
        text: 'Please select seat type.'
      });

      return;
    }

    if (!this.seatForm.coachId) {

      Swal.fire({
        icon: 'warning',
        title: 'Coach Required',
        text: 'Please select coach.'
      });

      return;
    }

    const request: SeatRequest = {
      seatNumber: this.seatForm.seatNumber.trim(),
      seatType: this.seatForm.seatType,
      coachId: Number(this.seatForm.coachId)
    };

    if (this.isEditMode && this.selectedSeatId) {

      this.updateSeat(request);

    } else {

      this.createSeat(request);
    }
  }

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------

  private createSeat(request: SeatRequest): void {

    Swal.fire({
      title: 'Adding Seat...',
      text: 'Please wait',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    });

    this.http
      .post<SeatResponse>(
        this.seatApiUrl,
        request
      )
      .subscribe({

        next: () => {

          Swal.close();

          this.closeModal();

          this.loadSeats(request.coachId);

          Swal.fire({
            icon: 'success',
            title: 'Seat Added',
            text: 'Seat added successfully.',
            timer: 1600,
            showConfirmButton: false
          });

        },

        error: error => {

          Swal.close();

          console.error('CREATE SEAT ERROR:', error);

          Swal.fire({
            icon: 'error',
            title: 'Unable to Add Seat',
            text:
              error?.error?.message ??
              'Seat could not be added.'
          });

        }

      });
  }

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------

  private updateSeat(request: SeatRequest): void {

    if (!this.selectedSeatId) {
      return;
    }

    Swal.fire({
      title: 'Updating Seat...',
      text: 'Please wait',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    });

    this.http
      .put<SeatResponse>(
        `${this.seatApiUrl}/${this.selectedSeatId}`,
        request
      )
      .subscribe({

        next: () => {

          Swal.close();

          this.closeModal();

          this.loadSeats(request.coachId);

          Swal.fire({
            icon: 'success',
            title: 'Seat Updated',
            text: 'Seat updated successfully.',
            timer: 1600,
            showConfirmButton: false
          });

        },

        error: error => {

          Swal.close();

          console.error('UPDATE SEAT ERROR:', error);

          Swal.fire({
            icon: 'error',
            title: 'Unable to Update Seat',
            text:
              error?.error?.message ??
              'Seat could not be updated.'
          });

        }

      });
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  deleteSeat(seat: SeatResponse): void {

    Swal.fire({
      title: 'Delete Seat?',
      text:
        `Are you sure you want to delete seat ${seat.seatNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      Swal.fire({
        title: 'Deleting...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading()
      });

      this.http
        .delete(`${this.seatApiUrl}/${seat.id}`)
        .subscribe({

          next: () => {

            Swal.close();

            this.loadSeats(
              this.selectedCoachId!
            );

            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              text: 'Seat deleted successfully.',
              timer: 1600,
              showConfirmButton: false
            });

          },

          error: error => {

            Swal.close();

            console.error('DELETE SEAT ERROR:', error);

            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text:
                error?.error?.message ??
                'Unable to delete seat.'
            });

          }

        });

    });
  }

  // --------------------------------------------------
  // BACK
  // --------------------------------------------------

  clearSelection(): void {

    this.selectedTrainId = null;
    this.selectedCoachId = null;

    this.coaches = [];
    this.seats = [];
    this.searchText = '';

    this.cdr.detectChanges();
  }
}