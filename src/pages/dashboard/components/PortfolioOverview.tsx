import { BarChartOutlined } from "@mui/icons-material";
import {
  Box,
  Card,
  Typography,
} from "@mui/material";

export default function PortfolioOverview() {
  return (
    <Card
      sx={{
        p: 3,
        minHeight: 380,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundImage: "none",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Portfolio Overview
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Your portfolio performance will appear here.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          height: 280,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        <BarChartOutlined
          sx={{
            fontSize: 42,
            mb: 1,
            opacity: 0.5,
          }}
        />

        <Typography variant="body2">
          Portfolio chart coming soon
        </Typography>
      </Box>
    </Card>
  );
}