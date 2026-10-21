export interface BookingRequest {
  trainId: number;
  seatId: number;
  journeyDate: string;
}


/* ================================
   My Bookings
================================ */

export interface MyBookingResponse {
  bookingId: number;
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  destinationStation: string;
  journeyDate: string;
  coachNumber: string;
  coachType: string;
  seatNumber: string;
  bookingStatus: string;
  paymentStatus: string | null;
}


/* ================================
   Create Booking Response
================================ */

export interface BookingResponse {
  bookingId: number;
  status: string;
  journeyDate: string;
  message: string;
}


/* ================================
   Booking Details
================================ */

export interface Booking {

  bookingId: number;

  bookingNumber: string;

  bookingStatus: string;

  bookingDate: string;

  journeyDate: string;

  paymentExpiresAt: string | null;

  train: {

    trainId: number;

    trainNumber: string;

    trainName: string;

    sourceStation: {

      stationId: number;

      stationCode: string;

      stationName: string;

      city?: string;

      state?: string;
    };

    destinationStation: {

      stationId: number;

      stationCode: string;

      stationName: string;

      city?: string;

      state?: string;
    };

    departureTime?: string | null;

    arrivalTime?: string | null;
  };

  seat: {

    seatId: number;

    seatNumber: string;

    seatType?: string | null;

    coach: {

      coachId: number;

      coachNumber: string;

      coachType: string;

      totalSeats?: number | null;
    };
  };

  payment: {

    paymentId: number;

    transactionId: string | null;

    razorpayOrderId: string | null;

    razorpayPaymentId: string | null;

    razorpayRefundId: string | null;

    amount: number;

    paymentMethod: string | null;

    paymentStatus: string | null;

    createdAt: string | null;

    updatedAt: string | null;
  } | null;
}