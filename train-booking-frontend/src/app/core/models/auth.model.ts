export interface LoginRequest {
  email: string;
  password: string;
}



export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}



export interface RegisterRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
}


export interface RegisterResponse {
  success: boolean;
  message: string;
}