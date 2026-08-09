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

import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import { authApi } from "../../api/auth.api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange =
    (field: keyof typeof form) =>
    (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await authApi.register(form);

      if (!response.success) {
        setError(
          response.message ||
            "Registration failed.",
        );

        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Account created successfully. Please sign in.",
        },
      });
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ mb: 4 }}>
        <Typography
        sx={{
          variant:"h4",
          fontWeight:800,
          mb:1
        }}
        >
          Create your account
        </Typography>

        <Typography color="text.secondary">
          Start your journey with Quantora.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
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
          label="Full name"
          value={form.fullName}
          onChange={handleChange("fullName")}
          required
          fullWidth
          autoComplete="name"
        />

        <TextField
          label="Email address"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          required
          fullWidth
          autoComplete="email"
        />

        <TextField
          label="Date of birth"
          type="date"
          value={form.dateOfBirth}
          onChange={handleChange(
            "dateOfBirth",
          )}
          required
          fullWidth
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />

        <TextField
          label="Password"
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={form.password}
          onChange={handleChange("password")}
          required
          fullWidth
          autoComplete="new-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
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
            fontWeight: 700,
          }}
        >
          {loading ? (
            <CircularProgress
              size={24}
              color="inherit"
            />
          ) : (
            "Create account"
          )}
        </Button>
      </Box>

      <Typography
  sx={{
    textAlign: "center",
    mt: 3,
    color: "text.secondary",
  }}
>
        Already have an account?{" "}
        <Link
          to="/login"
          style={{
            color: "#00D4FF",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Sign in
        </Link>
      </Typography>
    </AuthLayout>
  );
}