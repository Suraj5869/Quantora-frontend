import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

import {
  Logout,
  TrendingUp,
  AccountBalance,
  AutoGraph,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/auth.store";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore(
  (state) => state.logout
);
  const handleLogout = () => {
  logout();

  navigate("/login", {
    replace: true,
  });
};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 72,
          px: {
            xs: 2,
            md: 4,
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #242B3A",
          backgroundColor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00D4FF, #7C5CFC)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#080B12",
            }}
          >
            Q
          </Box>

          <Typography sx={{ fontWeight: 800, letterSpacing: 1 }}>
            QUANTORA
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            borderColor: "#242B3A",
            color: "text.secondary",
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Content */}
      <Box
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ variant: "h4", fontWeight: 800 }}>
            Welcome back, {user?.fullName || "Trader"}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
            }}
          >
            Your Quantora trading command center.
          </Typography>
        </Box>

        {/* Temporary cards */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: "1px solid #242B3A",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <TrendingUp color="primary" />

                  <Typography sx={{ fontWeight: 700 }}>Portfolio</Typography>
                </Box>

                <Typography sx={{ variant: "h5", fontWeight: 700 }}>
                  ₹0.00
                </Typography>

                <Typography sx={{ variant: "body2", color: "text.secondary" }}>
                  Total portfolio value
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: "1px solid #242B3A",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <AccountBalance color="primary" />

                  <Typography sx={{ fontWeight: 700 }}>Trading Mode</Typography>
                </Box>

                <Typography sx={{ variant: "h5", fontWeight: 700 }}>
                  Paper
                </Typography>

                <Typography sx={{ variant: "body2", color: "text.secondary" }}>
                  No real money at risk
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: "1px solid #242B3A",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <AutoGraph color="primary" />

                  <Typography sx={{ fontWeight: 700 }}>AI Strategy</Typography>
                </Box>

                <Typography sx={{ variant: "h5", fontWeight: 700 }}>
                  Not configured
                </Typography>

                <Typography sx={{ variant: "body2", color: "text.secondary" }}>
                  AI trading strategy
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Development notice */}
        <Card
          sx={{
            mt: 4,
            border: "1px solid rgba(0,212,255,0.25)",
            background: "rgba(0,212,255,0.04)",
          }}
        >
          <CardContent>
            <Typography sx={{ variant: "h6", fontWeight: 700, mb: 1 }}>
              Quantora is ready 🚀
            </Typography>

            <Typography sx={{ color: "text.secondary" }}>
              Authentication is connected successfully. The trading dashboard
              will be built in the next phase.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
