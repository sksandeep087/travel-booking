import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import { environment } from '../../../../../environments/environment';

import Swal from 'sweetalert2';


interface Train {
  id: number;
  trainNumber: string;
  trainName: string;
  sourceStationId: number;
  sourceStationName: string;
  sourceStationCode: string;
  destinationStationId: number;
  destinationStationName: string;
  destinationStationCode: string;
  departureTime: string;
  arrivalTime: string;
  active: boolean;
}


interface Coach {
  id: number;
  coachNumber: string;
  coachType: string;
  totalSeats: number;
  train: Train;
}


interface CoachRequest {
  coachNumber: string;
  coachType: string;
  totalSeats: number;
  trainId: number;
}


@Component({
  selector: 'app-manage-coaches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './manage-coaches.html',
  styleUrl: './manage-coaches.scss'
})
export class ManageCoaches implements OnInit {

  private readonly http = inject(HttpClient);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly apiUrl =
    `${environment.apiUrl}/admin/coaches`;

  private readonly trainApiUrl =
    `${environment.apiUrl}/trains`;


  trains: Train[] = [];

  coaches: Coach[] = [];

  filteredCoaches: Coach[] = [];


  selectedTrainId: number | null = null;


  loadingTrains = false;

  loadingCoaches = false;

  saving = false;


  errorMessage = '';

  searchText = '';


  showModal = false;

  isEditMode = false;

  editingCoachId: number | null = null;


  coachForm: CoachRequest = {
    coachNumber: '',
    coachType: '',
    totalSeats: 0,
    trainId: 0
  };


  coachTypes: string[] = [
    'GENERAL',
    'SLEEPER',
    'AC_3_TIER',
    'AC_2_TIER',
    'AC_FIRST_CLASS'
  ];


  ngOnInit(): void {
    this.loadTrains();
  }


  // =========================
  // LOAD TRAINS
  // =========================

  loadTrains(): void {

    this.loadingTrains = true;

    this.errorMessage = '';

    const headers = this.getHeaders();


    this.http
      .get<Train[]>(
        this.trainApiUrl,
        { headers }
      )
      .subscribe({

        next: response => {

          console.log(
            'TRAINS:',
            response
          );

          this.trains = response ?? [];

          this.loadingTrains = false;

          this.cdr.detectChanges();
        },

        error: error => {

          console.error(
            'LOAD TRAINS ERROR:',
            error
          );

          this.loadingTrains = false;

          if (error?.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error?.status === 403) {

            this.errorMessage =
              'Access denied. Admin permission required.';

          } else {

            this.errorMessage =
              error?.error?.message ??
              'Unable to load trains.';
          }

          this.cdr.detectChanges();
        }

      });
  }


  // =========================
  // TRAIN CHANGE
  // =========================

  onTrainChange(): void {

    this.searchText = '';

    this.coaches = [];

    this.filteredCoaches = [];


    if (this.selectedTrainId === null) {
      return;
    }


    this.loadCoaches();
  }


  // =========================
  // LOAD COACHES
  // =========================

  loadCoaches(): void {

    if (this.selectedTrainId === null) {
      return;
    }


    this.loadingCoaches = true;

    this.errorMessage = '';


    const headers = this.getHeaders();


    this.http
      .get<Coach[]>(
        `${this.apiUrl}/train/${this.selectedTrainId}`,
        { headers }
      )
      .subscribe({

        next: response => {

          console.log(
            'COACHES:',
            response
          );


          this.coaches =
            response ?? [];


          this.applySearch();


          this.loadingCoaches = false;


          this.cdr.detectChanges();
        },


        error: error => {

          console.error(
            'LOAD COACHES ERROR:',
            error
          );


          this.loadingCoaches = false;


          this.errorMessage =
            error?.error?.message ??
            'Unable to load coaches.';


          this.cdr.detectChanges();
        }

      });
  }


  // =========================
  // SEARCH
  // =========================

  applySearch(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredCoaches =
      this.coaches.filter(coach => {

        return (

          !search ||

          coach.coachNumber
            ?.toLowerCase()
            .includes(search) ||

          coach.coachType
            ?.toLowerCase()
            .includes(search)

        );

      });
  }


  onSearch(): void {
    this.applySearch();
  }


  clearSearch(): void {

    this.searchText = '';

    this.applySearch();
  }


  // =========================
  // SUMMARY
  // =========================

  get totalCoaches(): number {
    return this.coaches.length;
  }


  get totalSeats(): number {

    return this.coaches.reduce(
      (total, coach) =>
        total + (coach.totalSeats || 0),
      0
    );
  }


  // =========================
  // SELECTED TRAIN
  // =========================

  get selectedTrain(): Train | null {

    if (this.selectedTrainId === null) {
      return null;
    }

    return this.trains.find(
      train =>
        train.id === this.selectedTrainId
    ) ?? null;
  }


  // =========================
  // ADD
  // =========================

  openAddModal(): void {

    if (this.selectedTrainId === null) {

      Swal.fire({
        icon: 'warning',
        title: 'Select Train',
        text: 'Please select a train first.'
      });

      return;
    }


    this.isEditMode = false;

    this.editingCoachId = null;


    this.coachForm = {

      coachNumber: '',

      coachType: '',

      totalSeats: 0,

      trainId: this.selectedTrainId
    };


    this.showModal = true;


    this.cdr.detectChanges();
  }


  // =========================
  // EDIT
  // =========================

  openEditModal(
    coach: Coach
  ): void {

    this.isEditMode = true;

    this.editingCoachId =
      coach.id;


    this.coachForm = {

      coachNumber:
        coach.coachNumber,

      coachType:
        coach.coachType,

      totalSeats:
        coach.totalSeats,

      trainId:
        this.selectedTrainId ?? coach.train.id

    };


    this.showModal = true;


    this.cdr.detectChanges();
  }


  // =========================
  // CLOSE
  // =========================

  closeModal(): void {

    if (this.saving) {
      return;
    }


    this.showModal = false;

    this.isEditMode = false;

    this.editingCoachId = null;
  }


  // =========================
  // SAVE
  // =========================

  saveCoach(): void {

    const coachNumber =
      this.coachForm.coachNumber
        .trim()
        .toUpperCase();


    const coachType =
      this.coachForm.coachType;


    const totalSeats =
      Number(this.coachForm.totalSeats);


    if (!coachNumber) {

      Swal.fire({
        icon: 'warning',
        title: 'Coach Number Required',
        text: 'Please enter coach number.'
      });

      return;
    }


    if (!coachType) {

      Swal.fire({
        icon: 'warning',
        title: 'Coach Type Required',
        text: 'Please select coach type.'
      });

      return;
    }


    if (!totalSeats || totalSeats < 1) {

      Swal.fire({
        icon: 'warning',
        title: 'Invalid Seats',
        text: 'Total seats must be greater than 0.'
      });

      return;
    }


    if (!this.coachForm.trainId) {

      Swal.fire({
        icon: 'warning',
        title: 'Train Required',
        text: 'Please select a train.'
      });

      return;
    }


    const request: CoachRequest = {

      coachNumber,

      coachType,

      totalSeats,

      trainId:
        this.coachForm.trainId
    };


    this.saving = true;


    const headers =
      this.getHeaders();


    // =========================
    // UPDATE
    // =========================

    if (
      this.isEditMode &&
      this.editingCoachId !== null
    ) {

      this.http
        .put<Coach>(
          `${this.apiUrl}/${this.editingCoachId}`,
          request,
          { headers }
        )
        .subscribe({

          next: response => {

            this.saving = false;

            this.showModal = false;


            const index =
              this.coaches.findIndex(
                coach =>
                  coach.id === response.id
              );


            if (index !== -1) {

              this.coaches[index] =
                response;
            }


            this.applySearch();


            this.cdr.detectChanges();


            Swal.fire({

              icon: 'success',

              title: 'Coach Updated',

              text:
                'Coach updated successfully.',

              timer: 1800,

              showConfirmButton: false
            });
          },


          error: error => {

            this.saving = false;


            console.error(
              'UPDATE COACH ERROR:',
              error
            );


            Swal.fire({

              icon: 'error',

              title: 'Update Failed',

              text:
                error?.error?.message ??
                'Unable to update coach.'
            });
          }

        });


      return;
    }


    // =========================
    // CREATE
    // =========================

    this.http
      .post<Coach>(
        this.apiUrl,
        request,
        { headers }
      )
      .subscribe({

        next: response => {

          this.saving = false;

          this.showModal = false;


          this.coaches.unshift(
            response
          );


          this.applySearch();


          this.cdr.detectChanges();


          Swal.fire({

            icon: 'success',

            title: 'Coach Added',

            text:
              'Coach added successfully.',

            timer: 1800,

            showConfirmButton: false
          });
        },


        error: error => {

          this.saving = false;


          console.error(
            'CREATE COACH ERROR:',
            error
          );


          Swal.fire({

            icon: 'error',

            title: 'Add Coach Failed',

            text:
              error?.error?.message ??
              'Unable to add coach.'
          });
        }

      });
  }


  // =========================
  // DELETE
  // =========================

  deleteCoach(
    coach: Coach
  ): void {

    Swal.fire({

      title: 'Delete Coach?',

      text:
        `Are you sure you want to delete ${coach.coachNumber}?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText:
        'Yes, Delete',

      cancelButtonText:
        'Cancel',

      reverseButtons: true

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }


      const headers =
        this.getHeaders();


      Swal.fire({

        title: 'Deleting...',

        text: 'Please wait',

        allowOutsideClick: false,

        allowEscapeKey: false,

        didOpen: () => {

          Swal.showLoading();

        }

      });


      this.http
        .delete(
          `${this.apiUrl}/${coach.id}`,
          { headers }
        )
        .subscribe({

          next: () => {

            Swal.close();


            this.coaches =
              this.coaches.filter(
                item =>
                  item.id !== coach.id
              );


            this.applySearch();


            this.cdr.detectChanges();


            Swal.fire({

              icon: 'success',

              title: 'Deleted',

              text:
                'Coach deleted successfully.',

              timer: 1800,

              showConfirmButton: false
            });
          },


          error: error => {

            Swal.close();


            console.error(
              'DELETE COACH ERROR:',
              error
            );


            Swal.fire({

              icon: 'error',

              title: 'Delete Failed',

              text:
                error?.error?.message ??
                'Unable to delete coach.'
            });
          }

        });

    });
  }


  // =========================
  // BACK
  // =========================

  goBack(): void {

    this.router.navigate([
      '/admin/dashboard'
    ]);
  }


  // =========================
  // HEADERS
  // =========================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');


    return new HttpHeaders({

      Authorization:
        `Bearer ${token}`,

      'Content-Type':
        'application/json'
    });
  }


  // =========================
  // TRACK
  // =========================

  trackByCoachId(
    index: number,
    coach: Coach
  ): number {

    return coach.id;
  }

}