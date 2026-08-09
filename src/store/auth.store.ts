import { create } from "zustand";

import type { User } from "../features/auth/types/auth.types";
import { tokenStorage } from "../utils/storage";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => void;

  setUser: (user: User) => void;

  refreshTokens: (
  accessToken: string,
  refreshToken: string,
) => void;

  setLoading: (loading: boolean) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  isAuthenticated:
    !!tokenStorage.getAccessToken(),

  isLoading: true,

  setAuth: (
    user,
    accessToken,
    refreshToken,
  ) => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);

     tokenStorage.setRefreshToken(
        refreshToken,
      );

    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  refreshTokens: (
      accessToken,
      refreshToken,
    ) => {
      tokenStorage.setAccessToken(
        accessToken,
      );

      tokenStorage.setRefreshToken(
        refreshToken,
      );
    },
    
  setLoading: (loading) => {
    set({
      isLoading: loading,
    });
  },

  logout: () => {
    tokenStorage.clear();

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));