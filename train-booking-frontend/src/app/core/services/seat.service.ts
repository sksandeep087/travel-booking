import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Seat,
  SeatAvailability
} from '../models/seat.model';

@Injectable({
  providedIn: 'root'
})
export class SeatService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/seats`;


  // =====================================================
  // GET ALL SEATS BY COACH
  // =====================================================

  getSeatsByCoach(
    coachId: number
  ): Observable<Seat[]> {

    return this.http.get<Seat[]>(
      `${this.apiUrl}/coach/${coachId}`
    );

  }


  // =====================================================
  // GET SEAT AVAILABILITY BY JOURNEY DATE
  // =====================================================

  getSeatAvailability(
    coachId: number,
    journeyDate: string
  ): Observable<SeatAvailability[]> {

    const params = new HttpParams()
      .set('journeyDate', journeyDate);

    console.log(
      'Seat Availability API:',
      `${this.apiUrl}/coach/${coachId}/availability`
    );

    console.log(
      'Journey Date:',
      journeyDate
    );

    return this.http.get<SeatAvailability[]>(
      `${this.apiUrl}/coach/${coachId}/availability`,
      {
        params
      }
    );

  }

}