import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AppLayout from "../components/layout/AppLayout";
import ProfilePage from "../pages/profile/ProfilePage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/portfolio"
            element={
              <PagePlaceholder title="Portfolio" />
            }
          />

          <Route
            path="/watchlist"
            element={
              <PagePlaceholder title="Watchlist" />
            }
          />

          <Route
            path="/strategies"
            element={
              <PagePlaceholder title="Strategies" />
            }
          />

          <Route
            path="/ai-insights"
            element={
              <PagePlaceholder title="AI Insights" />
            }
          />

          <Route
            path="/paper-trading"
            element={
              <PagePlaceholder title="Paper Trading" />
            }
          />

          <Route
            path="/markets"
            element={
              <PagePlaceholder title="Markets" />
            }
          />

          <Route
  path="/profile"
  element={<ProfilePage />}
/>

          <Route
            path="/settings"
            element={
              <PagePlaceholder title="Settings" />
            }
          />
        </Route>
      </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function PagePlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}