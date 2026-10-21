import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';


export const routes: Routes = [

  // =====================================================
  // HOME - PUBLIC
  // =====================================================

  {
    path: '',

    loadComponent: () =>
      import('./features/home/home')
        .then(m => m.Home)
  },


  // =====================================================
  // LOGIN - PUBLIC
  // =====================================================

  {
    path: 'login',

    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },


  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password')
        .then(m => m.ForgotPassword)
  },


  // =====================================================
  // REGISTER - PUBLIC
  // =====================================================

  {
    path: 'register',

    loadComponent: () =>
      import('./features/auth/register/register')
        .then(m => m.Register)
  },


  // =====================================================
  // COACH SELECTION - LOGIN REQUIRED
  // =====================================================

  {
    path: 'coach-selection',

    canActivate: [authGuard],

    loadComponent: () =>
      import('./features/booking/coach-selection/coach-selection')
        .then(m => m.CoachSelection)
  },


  // =====================================================
  // SEAT SELECTION - LOGIN REQUIRED
  // =====================================================

  {
    path: 'seat-selection',

    canActivate: [authGuard],

    loadComponent: () =>
      import('./features/booking/seat-selection/seat-selection')
        .then(m => m.SeatSelection)
  },


  // =====================================================
  // BOOKING - LOGIN REQUIRED
  // =====================================================

  {
    path: 'booking',

    canActivate: [authGuard],

    loadComponent: () =>
      import('./features/booking/booking/booking')
        .then(m => m.BookingPage)
  },


  // =====================================================
  // BOOKING CONFIRMATION - LOGIN REQUIRED
  // =====================================================

  {
    path: 'booking-confirmation',

    canActivate: [authGuard],

    loadComponent: () =>
      import('./features/booking/booking-confirmation/booking-confirmation')
        .then(m => m.BookingConfirmation)
  },


  // =====================================================
  // MY BOOKINGS - LOGIN REQUIRED
  // =====================================================

  {
    path: 'my-bookings',

    canActivate: [authGuard],

    loadComponent: () =>
      import('./features/booking/my-bookings/my-bookings')
        .then(m => m.MyBookings)
  },


  // =====================================================
  // PAYMENT - LOGIN REQUIRED
  // =====================================================

  {
    path: 'payment',

    canActivate: [authGuard],

    loadComponent: () =>
      import('./features/payment/payment/payment')
        .then(m => m.Payment)
  },


  // =====================================================
  // ADMIN DASHBOARD - ADMIN ONLY
  // =====================================================

  {
    path: 'admin/dashboard',

    canActivate: [adminGuard],

    loadComponent: () =>
      import(
        './features/admin/dashboard/admin-dashboard/admin-dashboard'
      ).then(
        m => m.AdminDashboard
      )
  },


  // =====================================================
  // ADMIN TRAINS - ADMIN ONLY
  // =====================================================

  {
    path: 'admin/trains',

    canActivate: [adminGuard],

    loadComponent: () =>
      import('./features/admin/trains/manage-trains/manage-trains')
        .then(m => m.ManageTrains)
  },


  // =====================================================
  // ADMIN USERS - ADMIN ONLY
  // =====================================================

  {
    path: 'admin/users',

    canActivate: [adminGuard],

    loadComponent: () =>
      import('./features/admin/users/manage-users/manage-users')
        .then(m => m.ManageUsers)
  },


  // =====================================================
  // ADMIN USER DETAILS - ADMIN ONLY
  // =====================================================

  {
    path: 'admin/users/:id',

    canActivate: [adminGuard],

    loadComponent: () =>
      import('./features/admin/users/user-details/user-details')
        .then(m => m.UserDetails)
  },


  // =====================================================
  // ADMIN BOOKINGS - ADMIN ONLY
  // =====================================================

  {
    path: 'admin/bookings',

    canActivate: [adminGuard],

    loadComponent: () =>
      import('./features/admin/bookings/manage-bookings/manage-bookings')
        .then(m => m.ManageBookings)
  },


  // =====================================================
  // ADMIN BOOKING DETAILS - ADMIN ONLY
  // =====================================================

  {
    path: 'admin/bookings/:id',

    canActivate: [adminGuard],

    loadComponent: () =>
      import('./features/admin/bookings/booking-details/booking-details')
        .then(m => m.BookingDetails)
  },


  // =====================================================
  // ADMIN STATIONS - ADMIN ONLY
  // =====================================================

  {
    path: 'admin/stations',

    canActivate: [adminGuard],

    loadComponent: () =>
      import('./features/admin/stations/manage-stations/manage-stations')
        .then(m => m.ManageStations)
  },


  // =====================================================
  // ADMIN COACHES - ADMIN ONLY
  // =====================================================

  {
    path: 'admin/coaches',

    canActivate: [adminGuard],

    loadComponent: () =>
      import('./features/admin/coaches/manage-coaches/manage-coaches')
        .then(m => m.ManageCoaches)
  },


  // =====================================================
  // ADMIN SEATS - ADMIN ONLY
  // =====================================================

  {
    path: 'admin/seats',

    canActivate: [adminGuard],

    loadComponent: () =>
      import('./features/admin/seats/manage-seats/manage-seats')
        .then(m => m.ManageSeats)
  },


  // =====================================================
  // WILDCARD
  // =====================================================

  {
    path: '**',

    redirectTo: ''
  }

];