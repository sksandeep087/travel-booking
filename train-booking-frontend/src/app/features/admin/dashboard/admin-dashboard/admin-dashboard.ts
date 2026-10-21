import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../../../environments/environment';


interface AdminDashboardResponse {

  totalUsers: number;

  totalTrains: number;

  activeTrains: number;

  totalBookings: number;

  confirmedBookings: number;

  pendingBookings: number;

  cancelledBookings: number;
}


@Component({
  selector: 'app-admin-dashboard',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './admin-dashboard.html',

  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {

  private readonly http = inject(HttpClient);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly router = inject(Router);


  private readonly apiUrl =
    `${environment.apiUrl}/admin/dashboard`;


  dashboard: AdminDashboardResponse | null = null;

  loading = false;

  errorMessage = '';


  ngOnInit(): void {
    this.loadDashboard();
  }


  loadDashboard(): void {

    this.loading = true;

    this.errorMessage = '';


    this.http
      .get<AdminDashboardResponse>(this.apiUrl)
      .subscribe({

        next: (response) => {

          console.log(
            'ADMIN DASHBOARD:',
            response
          );

          this.dashboard = response;

          this.loading = false;

          this.cdr.detectChanges();
        },


        error: (error) => {

          console.error(
            'ADMIN DASHBOARD ERROR:',
            error
          );

          this.loading = false;

          this.errorMessage =
            error?.error?.message ??
            'Unable to load dashboard data.';

          this.cdr.detectChanges();
        }

      });
  }


  refresh(): void {
    this.loadDashboard();
  }


  // ==========================================
  // ADMIN NAVIGATION
  // ==========================================

  goToManageTrains(): void {

    this.router.navigate([
      '/admin/trains'
    ]);

  }


  goToManageUsers(): void {

    this.router.navigate([
      '/admin/users'
    ]);

  }


  goToManageBookings(): void {

    this.router.navigate([
      '/admin/bookings'
    ]);

  }

  goToManageCoaches(): void {
    this.router.navigate(['/admin/coaches']);
  }
  goToManageSeats(): void {
    this.router.navigate(['/admin/seats']);
  } 

}