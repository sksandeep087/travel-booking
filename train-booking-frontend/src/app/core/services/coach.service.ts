import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Coach } from '../models/coach.model';

@Injectable({
  providedIn: 'root'
})
export class CoachService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/coaches`;

  getCoachesByTrain(trainId: number): Observable<Coach[]> {

    return this.http.get<Coach[]>(
      `${this.apiUrl}/train/${trainId}`
    );
  }
}