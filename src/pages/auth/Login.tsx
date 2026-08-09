import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const registrationMessage = location.state?.message;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({
        email,
        password,
      });

      if (!response.success || !response.data) {
        setError(response.message || "Unable to login.");

        return;
      }

      const { accessToken, refreshToken, user } = response.data;

      setAuth(user, accessToken, refreshToken);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error: any) {
      setError(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 28, mb: 1 }}>
          Welcome back
        </Typography>

        <Typography color="text.secondary">
          Sign in to continue to Quantora.
        </Typography>
      </Box>

      {registrationMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {registrationMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <TextField
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
          autoComplete="email"
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          autoComplete="current-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((value) => !value)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 1,
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
        </Button>
      </Box>

      <Typography
        sx={{
          textAlign: "center",
          mt: 4,
          color: "text.secondary",
        }}
      >
        Don't have a Quantora account?{" "}
        <Link
          to="/register"
          style={{
            color: "#00D4FF",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Create one
        </Link>
      </Typography>
    </AuthLayout>
  );
}
