import { Box, Container, Grid, Paper } from "@mui/material";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, rgba(0,212,255,0.08), transparent 30%), radial-gradient(circle at 80% 80%, rgba(124,92,252,0.08), transparent 30%), #080B12",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 0, md: 8 }}
          sx={{
            alignItems: "center",
          }}
        >
          {/* Branding */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
            }}
          >
            <Box sx={{ maxWidth: 520 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 5,
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #00D4FF, #7C5CFC)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 20,
                    color: "#080B12",
                  }}
                >
                  Q
                </Box>

                <Box
                  sx={{
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  QUANTORA
                </Box>
              </Box>

              <Box
                component="h1"
                sx={{
                  fontSize: {
                    md: 48,
                    lg: 56,
                  },
                  lineHeight: 1.05,
                  fontWeight: 800,
                  mb: 3,
                  background: "linear-gradient(90deg, #F8FAFC, #00D4FF)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Trade smarter.
                <br />
                Let AI do the thinking.
              </Box>

              <Box
                sx={{
                  color: "text.secondary",
                  fontSize: 18,
                  lineHeight: 1.7,
                  mb: 5,
                }}
              >
                Analyze markets, test strategies with paper trading, and make
                data-driven trading decisions with Quantora.
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  color: "text.secondary",
                }}
              >
                {[
                  "AI-powered market analysis",
                  "Risk-controlled paper trading",
                  "Real-time portfolio insights",
                ].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        boxShadow: "0 0 12px rgba(0,212,255,0.7)",
                      }}
                    />

                    {item}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                maxWidth: 480,
                mx: "auto",
                p: {
                  xs: 3,
                  sm: 5,
                },
                border: "1px solid #242B3A",
                borderRadius: 3,
                background: "rgba(17,21,31,0.88)",
                backdropFilter: "blur(20px)",
              }}
            >
              {children}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
