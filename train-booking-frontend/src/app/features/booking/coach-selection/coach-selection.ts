import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CoachService } from '../../../core/services/coach.service';
import { Coach } from '../../../core/models/coach.model';

@Component({
  selector: 'app-coach-selection',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './coach-selection.html',
  styleUrl: './coach-selection.scss'
})
export class CoachSelection implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly coachService =
    inject(CoachService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // JOURNEY DATA
  // =====================================================

  trainId: number | null = null;

  sourceStationId: number | null = null;

  destinationStationId: number | null = null;

  journeyDate = '';


  // =====================================================
  // COACH DATA
  // =====================================================

  coaches: Coach[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  loadingCoaches = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      console.log(
        'Coach Selection Query Params:',
        params
      );


      // -------------------------------------------------
      // TRAIN ID
      // -------------------------------------------------

      this.trainId =
        params['trainId']
          ? Number(params['trainId'])
          : null;


      // -------------------------------------------------
      // SOURCE STATION
      // -------------------------------------------------

      this.sourceStationId =
        params['sourceStationId']
          ? Number(params['sourceStationId'])
          : null;


      // -------------------------------------------------
      // DESTINATION STATION
      // -------------------------------------------------

      this.destinationStationId =
        params['destinationStationId']
          ? Number(params['destinationStationId'])
          : null;


      // -------------------------------------------------
      // JOURNEY DATE
      // -------------------------------------------------

      this.journeyDate =
        params['journeyDate'] ?? '';


      console.log(
        'Train ID:',
        this.trainId
      );

      console.log(
        'Source Station ID:',
        this.sourceStationId
      );

      console.log(
        'Destination Station ID:',
        this.destinationStationId
      );

      console.log(
        'Journey Date:',
        this.journeyDate
      );


      // -------------------------------------------------
      // VALIDATE TRAIN
      // -------------------------------------------------

      if (!this.trainId) {

        this.loadingCoaches = false;

        this.errorMessage =
          'Train information is missing.';

        this.cdr.detectChanges();

        return;
      }


      // -------------------------------------------------
      // LOAD COACHES
      // -------------------------------------------------

      this.loadCoaches(this.trainId);

    });

  }


  // =====================================================
  // LOAD COACHES
  // =====================================================

  loadCoaches(trainId: number): void {

    console.log(
      'Loading coaches for train:',
      trainId
    );


    // Start loader
    this.loadingCoaches = true;

    this.errorMessage = '';

    this.coaches = [];


    // Refresh UI
    this.cdr.detectChanges();


    this.coachService
      .getCoachesByTrain(trainId)
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (response: Coach[]) => {

          console.log(
            'COACH API RESPONSE:',
            response
          );


          // Store coaches
          this.coaches =
            response ?? [];


          console.log(
            'COACH COUNT:',
            this.coaches.length
          );


          // Stop loader
          this.loadingCoaches = false;


          // No coaches
          if (this.coaches.length === 0) {

            this.errorMessage =
              'No coaches available for this train.';

          }


          console.log(
            'loadingCoaches =',
            this.loadingCoaches
          );


          // IMPORTANT
          // Refresh Angular UI
          this.cdr.detectChanges();


          console.log(
            'COACH UI REFRESHED'
          );

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'Coach API Error:',
            error
          );


          // Clear data
          this.coaches = [];


          // Stop loader
          this.loadingCoaches = false;


          // Error message
          this.errorMessage =
            error?.error?.message ??
            'Unable to load coaches.';


          console.log(
            'loadingCoaches =',
            this.loadingCoaches
          );


          // IMPORTANT
          // Refresh Angular UI
          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SELECT COACH
  // =====================================================

  selectCoach(coach: Coach): void {

    if (!coach?.id) {

      this.errorMessage =
        'Invalid coach selected.';

      this.cdr.detectChanges();

      return;
    }


    console.log(
      'Selected Coach:',
      coach
    );


    this.router.navigate(
      ['/seat-selection'],
      {
        queryParams: {

          trainId:
            this.trainId,

          coachId:
            coach.id,

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
  // GO BACK
  // =====================================================

  goBack(): void {

    this.router.navigate(
      ['/']
    );

  }


  // =====================================================
  // COACH TITLE
  // =====================================================

  getCoachTitle(
    type: string
  ): string {

    switch (type) {

      case 'GENERAL':
        return 'General Class';

      case 'SLEEPER':
        return 'Sleeper Class';

      case 'AC_3_TIER':
        return 'AC 3 Tier';

      case 'AC_2_TIER':
        return 'AC 2 Tier';

      case 'AC_FIRST_CLASS':
        return 'AC First Class';

      default:
        return type;

    }

  }


  // =====================================================
  // COACH ICON
  // =====================================================

  getCoachIcon(
    type: string
  ): string {

    switch (type) {

      case 'GENERAL':
        return 'bi-people-fill';

      case 'SLEEPER':
        return 'bi-moon-stars-fill';

      case 'AC_3_TIER':
        return 'bi-snow';

      case 'AC_2_TIER':
        return 'bi-snow2';

      case 'AC_FIRST_CLASS':
        return 'bi-star-fill';

      default:
        return 'bi-train-front-fill';

    }

  }

}