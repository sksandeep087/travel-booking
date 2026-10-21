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
  ActivatedRoute,
  Router
} from '@angular/router';

import { environment } from '../../../../../environments/environment';


interface AdminUser {

  id: number;

  name: string;

  email: string;

  mobile: string;

  role: string;

  createdAt: string;

  updatedAt: string;
}


@Component({
  selector: 'app-user-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './user-details.html',

  styleUrl: './user-details.scss'
})


export class UserDetails implements OnInit {

  private readonly http = inject(HttpClient);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);


  private readonly apiUrl =
    `${environment.apiUrl}/admin/users`;


  user: AdminUser | null = null;


  loading = false;

  errorMessage = '';


  ngOnInit(): void {

    this.loadUser();

  }


  loadUser(): void {

    const userId =
      this.route.snapshot.paramMap.get('id');


    if (!userId) {

      this.errorMessage =
        'User ID not found.';

      return;

    }


    const token =
      localStorage.getItem('token');


    const headers = new HttpHeaders({

      Authorization: `Bearer ${token}`

    });


    this.loading = true;

    this.errorMessage = '';


    this.http
      .get<AdminUser>(
        `${this.apiUrl}/${userId}`,
        {
          headers
        }
      )
      .subscribe({

        next: (response) => {

          console.log(
            'USER DETAILS:',
            response
          );


          this.user = response;

          this.loading = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'USER DETAILS ERROR:',
            error
          );


          this.loading = false;


          if (error?.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error?.status === 403) {

            this.errorMessage =
              'Access denied. Admin permission required.';

          } else if (error?.status === 404) {

            this.errorMessage =
              'User not found.';

          } else {

            this.errorMessage =
              error?.error?.message ??
              'Unable to load user details.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  goBack(): void {

    this.router.navigate([
      '/admin/users'
    ]);

  }


  getInitial(): string {

    if (!this.user?.name) {

      return '?';

    }


    return this.user.name
      .charAt(0)
      .toUpperCase();

  }

}