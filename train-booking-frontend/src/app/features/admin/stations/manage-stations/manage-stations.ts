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


interface Station {

  id: number;

  stationCode: string;

  stationName: string;

  city: string;

  state: string;

  createdAt: string;

  updatedAt: string;
}


interface StationRequest {

  stationCode: string;

  stationName: string;

  city: string;

  state: string;
}


@Component({

  selector: 'app-manage-stations',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './manage-stations.html',

  styleUrl: './manage-stations.scss'
})
export class ManageStations implements OnInit {


  private readonly http = inject(HttpClient);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);


  private readonly apiUrl =
    `${environment.apiUrl}/admin/stations`;


  stations: Station[] = [];

  filteredStations: Station[] = [];


  loading = false;

  saving = false;


  errorMessage = '';

  searchText = '';


  showModal = false;

  isEditMode = false;

  editingStationId: number | null = null;


  stationForm: StationRequest = {

    stationCode: '',

    stationName: '',

    city: '',

    state: ''
  };


  ngOnInit(): void {

    this.loadStations();

  }


  // =========================
  // LOAD STATIONS
  // =========================

  loadStations(): void {

    this.loading = true;

    this.errorMessage = '';


    const token =
      localStorage.getItem('token');


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      });


    this.http
      .get<Station[]>(
        this.apiUrl,
        { headers }
      )
      .subscribe({

        next: response => {

          console.log(
            'ADMIN STATIONS:',
            response
          );


          this.stations =
            response ?? [];


          this.applySearch();


          this.loading = false;


          this.cdr.detectChanges();

        },


        error: error => {

          console.error(
            'ADMIN STATIONS ERROR:',
            error
          );


          this.loading = false;


          if (error?.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }
          else if (error?.status === 403) {

            this.errorMessage =
              'Access denied. Admin permission required.';

          }
          else {

            this.errorMessage =
              error?.error?.message ??
              'Unable to load stations.';

          }


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


    this.filteredStations =
      this.stations.filter(station => {

        return (

          !search ||

          station.stationCode
            ?.toLowerCase()
            .includes(search) ||

          station.stationName
            ?.toLowerCase()
            .includes(search) ||

          station.city
            ?.toLowerCase()
            .includes(search) ||

          station.state
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

  get totalStations(): number {

    return this.stations.length;

  }


  get totalCities(): number {

    return new Set(
      this.stations
        .map(station => station.city)
        .filter(Boolean)
    ).size;

  }


  get totalStates(): number {

    return new Set(
      this.stations
        .map(station => station.state)
        .filter(Boolean)
    ).size;

  }


  // =========================
  // OPEN ADD
  // =========================

  openAddModal(): void {

    this.isEditMode = false;

    this.editingStationId = null;


    this.stationForm = {

      stationCode: '',

      stationName: '',

      city: '',

      state: ''

    };


    this.showModal = true;


    this.cdr.detectChanges();

  }


  // =========================
  // OPEN EDIT
  // =========================

  openEditModal(
    station: Station
  ): void {

    this.isEditMode = true;

    this.editingStationId =
      station.id;


    this.stationForm = {

      stationCode:
        station.stationCode,

      stationName:
        station.stationName,

      city:
        station.city,

      state:
        station.state

    };


    this.showModal = true;


    this.cdr.detectChanges();

  }


  // =========================
  // CLOSE MODAL
  // =========================

  closeModal(): void {

    if (this.saving) {
      return;
    }


    this.showModal = false;

    this.isEditMode = false;

    this.editingStationId = null;

  }


  // =========================
  // SAVE
  // =========================

  saveStation(): void {

    const stationCode =
      this.stationForm.stationCode
        .trim()
        .toUpperCase();


    const stationName =
      this.stationForm.stationName
        .trim();


    const city =
      this.stationForm.city
        .trim();


    const state =
      this.stationForm.state
        .trim();


    if (!stationCode) {

      Swal.fire({

        icon: 'warning',

        title: 'Station Code Required',

        text: 'Please enter station code.'

      });

      return;

    }


    if (!stationName) {

      Swal.fire({

        icon: 'warning',

        title: 'Station Name Required',

        text: 'Please enter station name.'

      });

      return;

    }


    if (!city) {

      Swal.fire({

        icon: 'warning',

        title: 'City Required',

        text: 'Please enter city.'

      });

      return;

    }


    if (!state) {

      Swal.fire({

        icon: 'warning',

        title: 'State Required',

        text: 'Please enter state.'

      });

      return;

    }


    const request: StationRequest = {

      stationCode,

      stationName,

      city,

      state

    };


    this.saving = true;


    const token =
      localStorage.getItem('token');


    const headers =
      new HttpHeaders({

        Authorization:
          `Bearer ${token}`,

        'Content-Type':
          'application/json'

      });


    // =========================
    // UPDATE
    // =========================

    if (
      this.isEditMode &&
      this.editingStationId !== null
    ) {

      this.http
        .put<Station>(
          `${this.apiUrl}/${this.editingStationId}`,
          request,
          { headers }
        )
        .subscribe({

          next: response => {

            this.saving = false;

            this.showModal = false;


            const index =
              this.stations.findIndex(
                station =>
                  station.id ===
                  response.id
              );


            if (index !== -1) {

              this.stations[index] =
                response;

            }


            this.applySearch();


            this.cdr.detectChanges();


            Swal.fire({

              icon: 'success',

              title: 'Station Updated',

              text:
                'Station updated successfully.',

              timer: 1800,

              showConfirmButton: false

            });

          },


          error: error => {

            this.saving = false;


            console.error(
              'UPDATE STATION ERROR:',
              error
            );


            Swal.fire({

              icon: 'error',

              title: 'Update Failed',

              text:
                error?.error?.message ??
                'Unable to update station.'

            });

          }

        });


      return;

    }


    // =========================
    // CREATE
    // =========================

    this.http
      .post<Station>(
        this.apiUrl,
        request,
        { headers }
      )
      .subscribe({

        next: response => {

          this.saving = false;

          this.showModal = false;


          this.stations.unshift(
            response
          );


          this.applySearch();


          this.cdr.detectChanges();


          Swal.fire({

            icon: 'success',

            title: 'Station Added',

            text:
              'Station added successfully.',

            timer: 1800,

            showConfirmButton: false

          });

        },


        error: error => {

          this.saving = false;


          console.error(
            'CREATE STATION ERROR:',
            error
          );


          Swal.fire({

            icon: 'error',

            title: 'Add Station Failed',

            text:
              error?.error?.message ??
              'Unable to add station.'

          });

        }

      });

  }


  // =========================
  // DELETE
  // =========================

  deleteStation(
    station: Station
  ): void {

    Swal.fire({

      title: 'Delete Station?',

      text:
        `Are you sure you want to delete ${station.stationCode} - ${station.stationName}?`,

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


      const token =
        localStorage.getItem('token');


      const headers =
        new HttpHeaders({

          Authorization:
            `Bearer ${token}`

        });


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
          `${this.apiUrl}/${station.id}`,
          { headers }
        )
        .subscribe({

          next: () => {

            Swal.close();


            this.stations =
              this.stations.filter(
                item =>
                  item.id !== station.id
              );


            this.applySearch();


            this.cdr.detectChanges();


            Swal.fire({

              icon: 'success',

              title: 'Deleted',

              text:
                'Station deleted successfully.',

              timer: 1800,

              showConfirmButton: false

            });

          },


          error: error => {

            Swal.close();


            console.error(
              'DELETE STATION ERROR:',
              error
            );


            Swal.fire({

              icon: 'error',

              title: 'Delete Failed',

              text:
                error?.error?.message ??
                'Unable to delete station.'

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
  // TRACK
  // =========================

  trackByStationId(
    index: number,
    station: Station
  ): number {

    return station.id;

  }

  goToManageStations(): void {
    this.router.navigate(['/admin/stations']);
  }

}