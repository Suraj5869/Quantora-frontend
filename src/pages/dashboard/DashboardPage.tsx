import {
  AccountBalanceWalletOutlined,
  AutoGraphOutlined,
  ShowChartOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useAuthStore } from "../../store/auth.store";
import DashboardStatCard from "./components/DashboardStatCard";
import PortfolioOverview from "./components/PortfolioOverview";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const firstName =
    user?.fullName?.split(" ")[0] || "Trader";

  return (
    <Box>
      {/* Page heading */}
      <Box sx={{ mb: { xs: 2.5, md: 4 } }}>
  <Typography
    variant="h4"
    sx={{
      fontWeight: 800,
      letterSpacing: "-1px",
      fontSize: {
        xs: "1.75rem",
        sm: "2rem",
        md: "2.125rem",
      },
    }}
  >
    Good afternoon, {firstName}
  </Typography>

  <Typography
    variant="body1"
    color="text.secondary"
    sx={{
      mt: 0.75,
      fontSize: {
        xs: "0.875rem",
        sm: "1rem",
      },
    }}
  >
    Here's an overview of your Quantora trading activity.
  </Typography>
</Box>
      {/* Statistics */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardStatCard
            title="Portfolio Value"
            value="₹0.00"
            subtitle="Not connected"
            icon={<AccountBalanceWalletOutlined />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardStatCard
            title="Today's P&L"
            value="₹0.00"
            subtitle="No market data"
            icon={<TrendingUpOutlined />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardStatCard
            title="Active Strategies"
            value="0"
            subtitle="Strategies configured"
            icon={<AutoGraphOutlined />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <DashboardStatCard
            title="Paper Trading"
            value="Inactive"
            subtitle="Start testing strategies"
            icon={<ShowChartOutlined />}
          />
        </Grid>
      </Grid>

      {/* Portfolio */}
      <Box sx={{ mt: 3 }}>
        <PortfolioOverview />
      </Box>
    </Box>
  );
}