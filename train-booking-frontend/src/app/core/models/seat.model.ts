export interface Seat {

  id: number;

  seatNumber: string;

  seatType: string;

  booked: boolean;

}


export interface SeatAvailability {

  seatId: number;

  seatNumber: string;

  seatType: string;

  booked: boolean;

}