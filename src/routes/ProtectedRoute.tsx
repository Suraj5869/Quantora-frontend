import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuthStore } from "../store/auth.store";

export default function ProtectedRoute() {
  const isAuthenticated =
    useAuthStore(
      (state) => state.isAuthenticated,
    );

  const isLoading =
    useAuthStore(
      (state) => state.isLoading,
    );

  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}