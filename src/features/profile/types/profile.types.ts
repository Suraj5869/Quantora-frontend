export interface Profile {
  id: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UpdateProfileRequest {
  fullName: string;
}