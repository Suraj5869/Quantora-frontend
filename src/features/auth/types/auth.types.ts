export interface User {
  id: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData | null;
  errors: string[] | null;
  traceId: string | null;
}