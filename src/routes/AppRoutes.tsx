import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AppLayout from "../components/layout/AppLayout";
import ProfilePage from "../pages/profile/ProfilePage";
import MarketsPage from "../pages/markets/MarketsPage";
import ScannerPage from "../pages/scanner/ScannerPage";
import BrokersPage from "../pages/brokers/BrokersPage";
import PaperTradingPage from "../pages/paper-trading/PaperTradingPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PagePlaceholder title="Portfolio" />} />
            <Route path="/watchlist" element={<PagePlaceholder title="Watchlist" />} />
            <Route path="/strategies" element={<PagePlaceholder title="Strategies" />} />
            <Route path="/ai-insights" element={<PagePlaceholder title="AI Insights" />} />
            <Route path="/paper-trading" element={<PaperTradingPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/brokers" element={<BrokersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<PagePlaceholder title="Settings" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function PagePlaceholder({ title }: { title: string }) {
  return <div><h1>{title}</h1></div>;
}
