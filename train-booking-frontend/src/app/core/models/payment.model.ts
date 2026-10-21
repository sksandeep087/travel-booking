export type PaymentMethod =
  | 'UPI'
  | 'CARD'
  | 'NET_BANKING'
  | 'WALLET';


export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED';


export interface PaymentRequest {

  bookingId: number;

  paymentMethod: PaymentMethod;

}


export interface PaymentVerificationRequest {

  razorpayOrderId: string;

  razorpayPaymentId: string;

  razorpaySignature: string;

}


export interface PaymentResponse {

  id: number;

  transactionId: string;

  razorpayOrderId: string;

  razorpayPaymentId?: string;

  razorpayRefundId?: string;

  bookingId: number;

  amount: number;

  paymentMethod: PaymentMethod;

  status: PaymentStatus;

  createdAt: string;

  updatedAt?: string;

}