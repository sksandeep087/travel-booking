import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';

import {
  environment
} from '../../../../../environments/environment';
import Swal from 'sweetalert2';


interface StationResponse {

  id: number;

  stationCode: string;

  stationName: string;

  city: string;

  state: string;

  createdAt?: string;

  updatedAt?: string;

}


interface TrainResponse {

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

  createdAt?: string;

  updatedAt?: string;

}


interface TrainRequest {

  trainNumber: string;

  trainName: string;

  sourceStationId: number | null;

  destinationStationId: number | null;

  departureTime: string;

  arrivalTime: string;

}


@Component({

  selector: 'app-manage-trains',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './manage-trains.html',

  styleUrl: './manage-trains.scss'

})
export class ManageTrains implements OnInit {


  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private readonly apiUrl =
    `${environment.apiUrl}/admin/trains`;

  private readonly stationApiUrl =
    `${environment.apiUrl}/stations`;


  // =================================================
  // DATA
  // =================================================

  trains: TrainResponse[] = [];

  stations: StationResponse[] = [];


  // =================================================
  // UI STATE
  // =================================================

  loading = false;

  stationLoading = false;

  saving = false;

  errorMessage = '';

  successMessage = '';


  // =================================================
  // SEARCH
  // =================================================

  searchText = '';


  // =================================================
  // FORM
  // =================================================

  showForm = false;

  editMode = false;

  editingTrainId: number | null = null;


  trainForm: TrainRequest = {

    trainNumber: '',

    trainName: '',

    sourceStationId: null,

    destinationStationId: null,

    departureTime: '',

    arrivalTime: ''

  };


  // =================================================
  // INIT
  // =================================================

  ngOnInit(): void {

    this.loadTrains();

    this.loadStations();

  }


  // =================================================
  // LOAD TRAINS
  // =================================================

  loadTrains(): void {

    this.loading = true;

    this.errorMessage = '';

    this.http
      .get<TrainResponse[]>(this.apiUrl)
      .subscribe({

        next: (response) => {

          this.trains = response;

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'LOAD TRAINS ERROR:',
            error
          );

          this.loading = false;

          this.errorMessage =
            error?.error?.message ??
            'Unable to load trains.';

          this.cdr.detectChanges();

        }

      });

  }


  // =================================================
  // LOAD STATIONS
  // =================================================

  loadStations(): void {

    this.stationLoading = true;

    this.http
      .get<StationResponse[]>(
        this.stationApiUrl
      )
      .subscribe({

        next: (response) => {

          this.stations = response;

          this.stationLoading = false;

        },

        error: (error) => {

          console.error(
            'LOAD STATIONS ERROR:',
            error
          );

          this.stationLoading = false;

          this.errorMessage =
            error?.error?.message ??
            'Unable to load stations.';

        }

      });

  }


  // =================================================
  // FILTER
  // =================================================

  get filteredTrains(): TrainResponse[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    if (!search) {

      return this.trains;

    }

    return this.trains.filter(
      train =>

        train.trainNumber
          ?.toLowerCase()
          .includes(search)

        ||

        train.trainName
          ?.toLowerCase()
          .includes(search)

        ||

        train.sourceStationName
          ?.toLowerCase()
          .includes(search)

        ||

        train.destinationStationName
          ?.toLowerCase()
          .includes(search)

    );

  }


  // =================================================
  // OPEN ADD FORM
  // =================================================

  openAddForm(): void {

    this.editMode = false;

    this.editingTrainId = null;

    this.resetForm();

    this.showForm = true;

    this.clearMessages();

  }


  // =================================================
  // OPEN EDIT FORM
  // =================================================

  openEditForm(train: TrainResponse): void {

    this.editMode = true;

    this.editingTrainId = train.id;

    this.trainForm = {

      trainNumber:
        train.trainNumber,

      trainName:
        train.trainName,

      sourceStationId:
        train.sourceStationId,

      destinationStationId:
        train.destinationStationId,

      departureTime:
        this.toDateTimeLocal(
          train.departureTime
        ),

      arrivalTime:
        this.toDateTimeLocal(
          train.arrivalTime
        )

    };

    this.showForm = true;

    this.clearMessages();

  }


  // =================================================
  // CLOSE FORM
  // =================================================

  closeForm(): void {

    this.showForm = false;

    this.editMode = false;

    this.editingTrainId = null;

    this.resetForm();

  }


  // =================================================
  // SAVE TRAIN
  // =================================================

  saveTrain(): void {

    this.clearMessages();

    if (!this.validateForm()) {

      return;

    }

    this.saving = true;


    if (this.editMode &&
      this.editingTrainId !== null) {

      this.updateTrain();

    } else {

      this.createTrain();

    }

  }


  // =================================================
  // CREATE TRAIN
  // =================================================

  private createTrain(): void {

    this.http
      .post<TrainResponse>(
        this.apiUrl,
        this.prepareRequest()
      )
      .subscribe({

        next: (response) => {

          console.log(
            'TRAIN CREATED:',
            response
          );

          this.ngZone.run(() => {

            this.saving = false;
            this.showForm = false;
            this.editMode = false;
            this.editingTrainId = null;

            this.resetForm();

            this.successMessage =
              'Train created successfully.';

            this.cdr.detectChanges();

          });

          this.loadTrains();

        },

        error: (error) => {

          console.error(
            'CREATE TRAIN ERROR:',
            error
          );

          this.ngZone.run(() => {

            this.saving = false;

            this.errorMessage =
              error?.error?.message ??
              'Unable to create train.';

            this.cdr.detectChanges();

          });

        }

      });

  }



  // =================================================
  // UPDATE TRAIN
  // =================================================

  private updateTrain(): void {

    this.http
      .put<TrainResponse>(
        `${this.apiUrl}/${this.editingTrainId}`,
        this.prepareRequest()
      )
      .subscribe({

        next: (response) => {

          console.log(
            'TRAIN UPDATED:',
            response
          );

          this.ngZone.run(() => {

            this.saving = false;
            this.showForm = false;
            this.editMode = false;
            this.editingTrainId = null;

            this.resetForm();

            this.successMessage =
              'Train updated successfully.';

            this.cdr.detectChanges();

          });

          this.loadTrains();

        },

        error: (error) => {

          console.error(
            'UPDATE TRAIN ERROR:',
            error
          );

          this.ngZone.run(() => {

            this.saving = false;

            this.errorMessage =
              error?.error?.message ??
              'Unable to update train.';

            this.cdr.detectChanges();

          });

        }

      });

  }



  // =================================================
  // CHANGE STATUS
  // =================================================

  toggleTrainStatus(
    train: TrainResponse
  ): void {

    const newStatus = !train.active;

    const action =
      newStatus
        ? 'activate'
        : 'deactivate';

    Swal.fire({
      title: `${newStatus ? 'Activate' : 'Deactivate'} Train?`,
      text: `${train.trainNumber} - ${train.trainName} will be ${action}d.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText:
        newStatus
          ? 'Yes, Activate'
          : 'Yes, Deactivate',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {

      if (!result.isConfirmed) {
        return;
      }

      this.http
        .patch<TrainResponse>(
          `${this.apiUrl}/${train.id}/status`,
          null,
          {
            params: {
              active: newStatus
            }
          }
        )
        .subscribe({

          next: (response) => {

            train.active =
              response.active;

            this.cdr.detectChanges();

            Swal.fire({
              icon: 'success',
              title: response.active
                ? 'Train Activated'
                : 'Train Deactivated',
              text: response.active
                ? 'Train is now active.'
                : 'Train is now inactive.',
              timer: 1600,
              showConfirmButton: false
            });

          },

          error: (error) => {

            console.error(
              'STATUS UPDATE ERROR:',
              error
            );

            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text:
                error?.error?.message ??
                'Unable to update train status.'
            });

          }

        });

    });

  }


  // =================================================
  // DELETE TRAIN
  // =================================================

  deleteTrain(train: TrainResponse): void {

    Swal.fire({
      title: 'Delete Train?',
      text: `Are you sure you want to delete ${train.trainNumber} - ${train.trainName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {

      if (!result.isConfirmed) {
        return;
      }

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
          `${this.apiUrl}/${train.id}`
        )
        .subscribe({

          next: () => {

            Swal.close();

            this.loadTrains();

            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              text: 'Train deleted successfully.',
              timer: 1800,
              showConfirmButton: false
            });

          },

          error: (error) => {

            console.error(
              'DELETE TRAIN ERROR:',
              error
            );

            Swal.close();

            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text:
                error?.error?.message ??
                'Unable to delete train.'
            });

          }

        });

    });

  }


  // =================================================
  // VALIDATE FORM
  // =================================================

  private validateForm(): boolean {

    if (!this.trainForm.trainNumber.trim()) {

      this.errorMessage =
        'Train number is required.';

      return false;

    }

    if (!this.trainForm.trainName.trim()) {

      this.errorMessage =
        'Train name is required.';

      return false;

    }

    if (
      this.trainForm.sourceStationId === null
    ) {

      this.errorMessage =
        'Source station is required.';

      return false;

    }

    if (
      this.trainForm.destinationStationId === null
    ) {

      this.errorMessage =
        'Destination station is required.';

      return false;

    }

    if (
      this.trainForm.sourceStationId ===
      this.trainForm.destinationStationId
    ) {

      this.errorMessage =
        'Source and destination cannot be same.';

      return false;

    }

    if (!this.trainForm.departureTime) {

      this.errorMessage =
        'Departure time is required.';

      return false;

    }

    if (!this.trainForm.arrivalTime) {

      this.errorMessage =
        'Arrival time is required.';

      return false;

    }

    return true;

  }


  // =================================================
  // PREPARE REQUEST
  // =================================================

  private prepareRequest(): TrainRequest {

    return {

      trainNumber:
        this.trainForm.trainNumber.trim(),

      trainName:
        this.trainForm.trainName.trim(),

      sourceStationId:
        this.trainForm.sourceStationId,

      destinationStationId:
        this.trainForm.destinationStationId,

      departureTime:
        this.trainForm.departureTime,

      arrivalTime:
        this.trainForm.arrivalTime

    };

  }


  // =================================================
  // RESET FORM
  // =================================================

  private resetForm(): void {

    this.trainForm = {

      trainNumber: '',

      trainName: '',

      sourceStationId: null,

      destinationStationId: null,

      departureTime: '',

      arrivalTime: ''

    };

  }


  // =================================================
  // DATETIME FORMAT
  // =================================================

  private toDateTimeLocal(
    value: string
  ): string {

    if (!value) {

      return '';

    }

    return value.substring(
      0,
      16
    );

  }


  // =================================================
  // CLEAR MESSAGES
  // =================================================

  private clearMessages(): void {

    this.errorMessage = '';

    this.successMessage = '';

  }


  // =================================================
  // TRACK BY
  // =================================================

  trackByTrainId(
    index: number,
    train: TrainResponse
  ): number {

    return train.id;

  }

}