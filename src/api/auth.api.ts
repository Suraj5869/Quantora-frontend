import apiClient from "./axios";

import type { ApiResponse } from "../types/api";

import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  User,
} from "../features/auth/types/auth.types";

export const authApi = {
  register: async (
    request: RegisterRequest,
  ): Promise<ApiResponse> => {
    const response =
      await apiClient.post<ApiResponse>(
        "/auth/register",
        request,
      );

    return response.data;
  },

  login: async (
    request: LoginRequest,
  ): Promise<AuthResponse> => {
    const response =
      await apiClient.post<AuthResponse>(
        "/auth/login",
        request,
      );

    return response.data;
  },

  refresh: async (
    request: RefreshTokenRequest,
  ): Promise<AuthResponse> => {
    const response =
      await apiClient.post<AuthResponse>(
        "/auth/refresh",
        request,
      );

    return response.data;
  },

  logout: async (
    request: RefreshTokenRequest,
  ): Promise<ApiResponse> => {
    const response =
      await apiClient.post<ApiResponse>(
        "/auth/logout",
        request,
      );

    return response.data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response =
      await apiClient.get<ApiResponse<User>>(
        "/auth/me",
      );

    return response.data;
  },
};