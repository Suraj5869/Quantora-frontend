import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { authApi } from "./auth.api";
import { tokenStorage } from "../utils/storage";
import { useAuthStore } from "../store/auth.store";
import { refreshAccessToken } from "./auth-refresh";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

let isRefreshing = false;

let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeToTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const notifyTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));

  refreshSubscribers = [];
};

/* =========================
   REQUEST INTERCEPTOR
========================= */

apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

/* =========================
   RESPONSE INTERCEPTOR
========================= */

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | InternalAxiosRequestConfig
      | undefined;

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    /*
     * Never attempt to refresh
     * the refresh request itself.
     */
    if (originalRequest.url?.includes("/auth/refresh")) {
      useAuthStore.getState().logout();

      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      useAuthStore.getState().logout();

      return Promise.reject(error);
    }

    /*
     * If another request is already
     * refreshing, wait for it.
     */
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeToTokenRefresh((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await refreshAccessToken(refreshToken);

      if (!response.success || !response.data) {
        throw new Error("Token refresh failed.");
      }

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      /*
       * Store the new token pair.
       */
      useAuthStore.getState().refreshTokens(accessToken, newRefreshToken);

      /*
       * Notify requests that were
       * waiting for the refresh.
       */
      notifyTokenRefreshed(accessToken);

      /*
       * Retry the original request
       * using the new access token.
       */
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshSubscribers = [];

      useAuthStore.getState().logout();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
