import { useEffect } from "react";

import { authApi } from "../../../api/auth.api";
import { useAuthStore } from "../../../store/auth.store";
import { tokenStorage } from "../../../utils/storage";

export function useAuthInitialization() {
  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const setLoading = useAuthStore(
    (state) => state.setLoading,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken =
        tokenStorage.getAccessToken();

      // No token = user is not logged in.
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await authApi.me();

        if (
          response.success &&
          response.data
        ) {
          setUser(
            response.data,
          );
        } else {
          logout();
        }
      } catch {
        logout();
      }
    };

    initializeAuth();
  }, [setUser, setLoading, logout]);
}