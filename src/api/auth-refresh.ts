import axios from "axios";

import type { AuthResponse } from "../features/auth/types/auth.types";

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<AuthResponse> => {
  const response =
    await refreshClient.post<AuthResponse>(
      "/auth/refresh",
      {
        refreshToken,
      },
    );

  return response.data;
};