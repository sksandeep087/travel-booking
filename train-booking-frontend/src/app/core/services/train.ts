import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Train } from '../models/train.model';

@Injectable({
  providedIn: 'root'
})
export class TrainService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/trains`;

  searchTrains(
    sourceStationId: number,
    destinationStationId: number
  ): Observable<Train[]> {

    const params = new HttpParams()
      .set('sourceStationId', sourceStationId)
      .set('destinationStationId', destinationStationId);

    return this.http.get<Train[]>(
      `${this.apiUrl}/search`,
      { params }
    );
  }
}