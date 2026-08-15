import { Box, Card, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface DashboardStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
}

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: DashboardStatCardProps) {
  return (
    <Card
  sx={{
    p: {
      xs: 2,
      sm: 3,
    },
    minHeight: {
      xs: 320,
      sm: 380,
    },
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    backgroundImage: "none",
  }}
>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {title}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            {value}
          </Typography>

          {(subtitle || trend) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1,
              }}
            >
              {trend && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "success.main",
                    fontWeight: 600,
                  }}
                >
                  {trend}
                </Typography>
              )}

              {subtitle && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 215, 0, 0.08)",
            color: "primary.main",
          }}
        >
          {icon}
        </Box>
      </Box>
    </Card>
  );
}