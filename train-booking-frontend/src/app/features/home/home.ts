import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { StationService } from '../../core/services/station';
import { TrainService } from '../../core/services/train';

import { Station } from '../../core/models/station.model';
import { Train } from '../../core/models/train.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private readonly stationService = inject(StationService);

  private readonly trainService = inject(TrainService);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);


  // =====================================================
  // DATA
  // =====================================================

  stations: Station[] = [];

  trains: Train[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  sourceStationId: number | null = null;

  destinationStationId: number | null = null;

  journeyDate = '';

  minJourneyDate = '';


  // =====================================================
  // LOADING
  // =====================================================

  loadingStations = false;

  searchingTrains = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.setMinimumJourneyDate();

    this.loadStations();

  }


  // =====================================================
  // DATE
  // =====================================================

  private setMinimumJourneyDate(): void {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      today.getDate()
    ).padStart(2, '0');

    this.minJourneyDate =
      `${year}-${month}-${day}`;

    this.journeyDate =
      this.minJourneyDate;

  }


  // =====================================================
  // LOAD STATIONS
  // =====================================================

  loadStations(): void {

    this.loadingStations = true;

    this.errorMessage = '';

    this.stationService
      .getAllStations()
      .subscribe({

        next: (response: Station[]) => {

          console.log(
            'Stations API Response:',
            response
          );

          this.stations =
            response ?? [];

          console.log(
            'Stations Loaded:',
            this.stations.length
          );

          this.loadingStations = false;

          // Refresh UI
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Station API Error:',
            error
          );

          this.stations = [];

          this.loadingStations = false;

          this.errorMessage =
            error?.error?.message ??
            'Unable to load stations. Please try again.';

          // Refresh UI
          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SEARCH TRAINS
  // =====================================================

  searchTrains(): void {

    // Clear previous state
    this.errorMessage = '';

    this.trains = [];


    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (this.sourceStationId === null) {

      this.errorMessage =
        'Please select departure station.';

      return;

    }


    if (this.destinationStationId === null) {

      this.errorMessage =
        'Please select destination station.';

      return;

    }


    if (
      this.sourceStationId ===
      this.destinationStationId
    ) {

      this.errorMessage =
        'Departure and destination stations cannot be same.';

      return;

    }


    if (!this.journeyDate) {

      this.errorMessage =
        'Please select journey date.';

      return;

    }


    // ---------------------------------------------------
    // START SEARCH
    // ---------------------------------------------------

    this.searchingTrains = true;

    // Immediately update button
    this.cdr.detectChanges();


    console.log('=================================');
    console.log('SEARCH START');
    console.log('=================================');

    console.log({
      sourceStationId:
        this.sourceStationId,

      destinationStationId:
        this.destinationStationId,

      journeyDate:
        this.journeyDate
    });


    // ---------------------------------------------------
    // API CALL
    // ---------------------------------------------------

    this.trainService
      .searchTrains(
        this.sourceStationId,
        this.destinationStationId
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (response: Train[]) => {

          console.log(
            'TRAIN RESPONSE:',
            response
          );


          // Store response
          this.trains =
            response ?? [];


          console.log(
            'TRAINS COUNT:',
            this.trains.length
          );


          // Stop loader
          this.searchingTrains = false;


          // No train found
          if (this.trains.length === 0) {

            this.errorMessage =
              'No trains available for the selected route.';

          }


          console.log(
            'searchingTrains =',
            this.searchingTrains
          );


          // IMPORTANT:
          // Force Angular UI refresh
          this.cdr.detectChanges();


          console.log(
            'UI REFRESHED'
          );

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'TRAIN SEARCH ERROR:',
            error
          );


          // Clear trains
          this.trains = [];


          // Stop loader
          this.searchingTrains = false;


          // Error message
          this.errorMessage =
            error?.error?.message ??
            'Unable to search trains.';


          console.log(
            'searchingTrains =',
            this.searchingTrains
          );


          // IMPORTANT:
          // Force Angular UI refresh
          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SWAP STATIONS
  // =====================================================

  swapStations(): void {

    const temp =
      this.sourceStationId;

    this.sourceStationId =
      this.destinationStationId;

    this.destinationStationId =
      temp;


    // Clear old results
    this.trains = [];

    this.errorMessage = '';


    // Refresh UI
    this.cdr.detectChanges();

  }


  // =====================================================
  // STATION NAME
  // =====================================================

  getStationName(
    id: number
  ): string {

    const station =
      this.stations.find(
        station =>
          station.id === id
      );

    return station?.stationName ?? '';

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


    // Fallback
    return time.substring(0, 5);

  }


  // =====================================================
  // SELECT TRAIN
  // =====================================================

  selectTrain(
    train: Train
  ): void {

    if (!train?.id) {

      this.errorMessage =
        'Invalid train selected.';

      return;

    }


    console.log(
      'Selected Train:',
      train
    );


    this.router.navigate(
      ['/coach-selection'],
      {
        queryParams: {

          trainId:
            train.id,

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
  // LOGOUT
  // =====================================================

  logout(): void {

    localStorage.removeItem('token');

    this.router.navigate(
      ['/login']
    );

  }

}