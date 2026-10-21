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

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import Swal from 'sweetalert2';


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
  selector: 'app-manage-users',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './manage-users.html',

  styleUrl: './manage-users.scss'
})


export class ManageUsers implements OnInit {

  private readonly http = inject(HttpClient);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);


  /*
   * Backend API
   *
   * http://localhost:8080/api/admin/users
   */
  private readonly apiUrl =
    `${environment.apiUrl}/admin/users`;


  /*
   * Users
   */
  users: AdminUser[] = [];

  filteredUsers: AdminUser[] = [];


  /*
   * Loading
   */
  loading = false;


  /*
   * Search
   */
  searchText = '';


  /*
   * Role filter
   */
  selectedRole = 'ALL';


  /*
   * Messages
   */
  errorMessage = '';

  successMessage = '';


  /*
   * Component initialization
   */
  ngOnInit(): void {

    this.loadUsers();

  }


  /*
   * Load users from backend
   */
  loadUsers(): void {

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';


    /*
     * Get JWT token from localStorage
     */
    const token = localStorage.getItem('token');


    /*
     * Authorization header
     */
    const headers = new HttpHeaders({

      Authorization: `Bearer ${token}`

    });


    /*
     * API call
     */
    this.http
      .get<AdminUser[]>(
        this.apiUrl,
        {
          headers
        }
      )
      .subscribe({

        next: (response) => {

          console.log(
            'ADMIN USERS API RESPONSE:',
            response
          );


          /*
           * Store users
           */
          this.users = response ?? [];


          /*
           * Apply search/filter
           */
          this.applyFilters();


          /*
           * Stop loading
           */
          this.loading = false;


          /*
           * Update UI
           */
          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'ADMIN USERS API ERROR:',
            error
          );


          this.loading = false;


          /*
           * Backend error message
           */
          this.errorMessage =
            error?.error?.message ??
            'Unable to load users.';


          /*
           * Handle unauthorized
           */
          if (error?.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }


          /*
           * Handle forbidden
           */
          if (error?.status === 403) {

            this.errorMessage =
              'Access denied. Admin permission required.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  /*
   * Search + Role filter
   */
  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredUsers =
      this.users.filter((user) => {


        /*
         * Search filter
         */
        const matchesSearch =

          !search ||

          user.name
            ?.toLowerCase()
            .includes(search) ||

          user.email
            ?.toLowerCase()
            .includes(search) ||

          user.mobile
            ?.toLowerCase()
            .includes(search);


        /*
         * Role filter
         */
        const matchesRole =

          this.selectedRole === 'ALL' ||

          user.role === this.selectedRole;


        return matchesSearch && matchesRole;

      });

  }


  /*
   * Search input
   */
  onSearch(): void {

    this.applyFilters();

  }


  /*
   * Role dropdown
   */
  onRoleChange(): void {

    this.applyFilters();

  }


  /*
   * Clear search/filter
   */
  clearSearch(): void {

    this.searchText = '';

    this.selectedRole = 'ALL';

    this.applyFilters();

  }


  /*
   * Total users
   */
  get totalUsers(): number {

    return this.users.length;

  }


  /*
   * Total admins
   */
  get adminCount(): number {

    return this.users.filter(
      user => user.role === 'ADMIN'
    ).length;

  }


  /*
   * Total normal users
   */
  get normalUserCount(): number {

    return this.users.filter(
      user => user.role === 'USER'
    ).length;

  }


  /*
   * View user
   */
  viewUser(user: AdminUser): void {

    this.router.navigate([
      '/admin/users',
      user.id
    ]);

  }


  /*
   * Back to admin dashboard
   */
  goBack(): void {

    this.router.navigate([
      '/admin/dashboard'
    ]);

  }


  /*
   * Track users
   */
  trackByUserId(
    index: number,
    user: AdminUser
  ): number {

    return user.id;

  }

  changeUserRole(user: any): void {

    const loggedInEmail =
      localStorage.getItem('userEmail') ?? '';

    // Self role change protection
    if (
      loggedInEmail &&
      user.email &&
      loggedInEmail.toLowerCase() ===
      user.email.toLowerCase()
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Action Not Allowed',
        text: 'You cannot change your own role.',
        confirmButtonText: 'OK'
      });

      return;
    }

    const newRole =
      user.role === 'ADMIN'
        ? 'USER'
        : 'ADMIN';

    Swal.fire({
      title: 'Change User Role?',
      html: `
      <div style="font-size:15px;">
        <strong>${user.name}</strong><br>
        <span style="color:#6c757d;">
          ${user.email}
        </span>

        <br><br>

        Current Role:
        <strong>${user.role}</strong>

        <br>

        New Role:
        <strong>${newRole}</strong>
      </div>
    `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText:
        newRole === 'ADMIN'
          ? 'Make Admin'
          : 'Make User',
      cancelButtonText: 'Cancel',
      reverseButtons: true

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      Swal.fire({
        title: 'Updating Role...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.http.patch<any>(
        `${this.apiUrl}/${user.id}/role`,
        {
          role: newRole
        }
      ).subscribe({

        next: (response) => {

          Swal.close();

          console.log(
            'ROLE CHANGE RESPONSE:',
            response
          );

          // ==========================================
          // 1. UPDATE SELECTED USER IMMEDIATELY
          // ==========================================

          user.role =
            response?.role ?? newRole;


          // ==========================================
          // 2. UPDATE ORIGINAL USERS ARRAY
          // ==========================================

          const index =
            this.users.findIndex(
              u => u.id === user.id
            );

          if (index !== -1) {

            this.users[index] = {
              ...this.users[index],
              role: response?.role ?? newRole
            };

          }


          // ==========================================
          // 3. FORCE FILTERED LIST REFRESH
          // ==========================================

          this.applyFilters();


          // ==========================================
          // 4. FORCE ANGULAR UI REFRESH
          // ==========================================

          this.cdr.detectChanges();


          // ==========================================
          // 5. SUCCESS MESSAGE
          // ==========================================

          Swal.fire({
            icon: 'success',
            title: 'Role Updated',
            text:
              `${user.name} is now ${user.role}.`,
            timer: 1500,
            showConfirmButton: false
          });

        },

        error: (error) => {

          Swal.close();

          console.error(
            'CHANGE USER ROLE ERROR:',
            error
          );

          Swal.fire({
            icon: 'error',
            title: 'Role Update Failed',
            text:
              error?.error?.message ??
              'Unable to change user role.'
          });

        }

      });

    });

  }

}