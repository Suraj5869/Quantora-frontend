import {
  AccountCircleOutlined,
  CalendarMonthOutlined,
  CheckCircleOutlined,
  EmailOutlined,
  PersonOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile, useUpdateProfile } from "../../features/profile/hooks/useProfile";
import { useAuthStore } from "../../store/auth.store";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import BrokerConnectionCard from "./components/BrokerConnectionCard";
import { BROKER_CONNECTION_QUERY_KEY } from "../../features/broker/hooks/useBroker";

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(150, "Full name cannot exceed 150 characters."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useProfile();

  const updateProfileMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
      isDirty,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
    },
  });

  useEffect(() => {
    const broker = searchParams.get("broker");
    const status = searchParams.get("status");
    const reason = searchParams.get("reason");

    if (broker !== "upstox" || !status) {
      return;
    }

    if (status === "connected") {
      toast.success("Upstox connected successfully.");
      queryClient.invalidateQueries({
        queryKey: BROKER_CONNECTION_QUERY_KEY,
      });
    } else {
      toast.error(
        reason || "Unable to connect Upstox. Please try again.",
      );
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("broker");
    nextParams.delete("status");
    nextParams.delete("reason");
    setSearchParams(nextParams, { replace: true });
  }, [queryClient, searchParams, setSearchParams]);

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
      });
    }
  }, [profile, reset]);

  const handleUpdateProfile = async (
    values: ProfileFormValues,
  ) => {
    try {
      await updateProfileMutation.mutateAsync({
        fullName: values.fullName.trim(),
      });

      reset({
        fullName: values.fullName.trim(),
      });

      toast.success("Profile updated successfully.");

      /*
       * Keep the authentication store synchronized
       * with the updated profile name.
       */
      useAuthStore.getState().setUser({
        ...authUser!,
        fullName: values.fullName.trim(),
      });
    } catch {
      toast.error(
        "Unable to update your profile. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Box>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          }
        >
          Unable to load your profile.
        </Alert>
      </Box>
    );
  }

  const initials =
    profile.fullName
      .split(" ")
      .filter(Boolean)
      .map((name:any) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "Q";

  const memberSince = new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(profile.createdAt));

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
      }}
    >
      {/* Page header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
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
          Profile
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.75 }}
        >
          Manage your Quantora account information.
        </Typography>
      </Box>

      {/* Profile summary */}
      <Card
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              fontSize: 24,
              fontWeight: 700,
              backgroundColor: "primary.main",
              color: "common.black",
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              {profile.fullName}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                wordBreak: "break-word",
              }}
            >
              {profile.email}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 1.5,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Chip
                size="small"
                icon={
                  profile.isEmailVerified ? (
                    <CheckCircleOutlined />
                  ) : (
                    <EmailOutlined />
                  )
                }
                label={
                  profile.isEmailVerified
                    ? "Email verified"
                    : "Email not verified"
                }
                color={
                  profile.isEmailVerified
                    ? "success"
                    : "default"
                }
                variant="outlined"
              />

              <Chip
                size="small"
                label={
                  profile.isActive
                    ? "Active account"
                    : "Inactive account"
                }
                color={
                  profile.isActive
                    ? "success"
                    : "error"
                }
                variant="outlined"
              />
            </Stack>
          </Box>
        </Box>
      </Card>

      {/* Personal information */}
      <Card
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          mb: 3,
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
            gap: 1.5,
            mb: 2,
          }}
        >
          <PersonOutlined color="primary" />

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Personal Information
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Update your basic account information.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box
          component="form"
          onSubmit={handleSubmit(handleUpdateProfile)}
        >
          <Stack spacing={2.5}>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={!!errors.fullName}
                  helperText={
                    errors.fullName?.message
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <PersonOutlined
                          sx={{
                            mr: 1,
                            color: "text.secondary",
                          }}
                        />
                      ),
                    },
                  }}
                />
              )}
            />

            <TextField
              fullWidth
              label="Email Address"
              value={profile.email}
              disabled
              slotProps={{
                input: {
                  startAdornment: (
                    <EmailOutlined
                      sx={{
                        mr: 1,
                        color: "text.secondary",
                      }}
                    />
                  ),
                },
              }}
              helperText="Email address cannot be changed here."
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Member Since"
                value={memberSince}
                disabled
                slotProps={{
                  input: {
                    startAdornment: (
                      <CalendarMonthOutlined
                        sx={{
                          mr: 1,
                          color: "text.secondary",
                        }}
                      />
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Last Login"
                value={
                  profile.lastLoginAt
                    ? new Intl.DateTimeFormat(
                        "en-IN",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      ).format(
                        new Date(profile.lastLoginAt),
                      )
                    : "Not available"
                }
                disabled
                slotProps={{
                  input: {
                    startAdornment: (
                      <AccountCircleOutlined
                        sx={{
                          mr: 1,
                          color: "text.secondary",
                        }}
                      />
                    ),
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                pt: 1,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  updateProfileMutation.isPending ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <SaveOutlined />
                  )
                }
                disabled={
                  !isDirty ||
                  updateProfileMutation.isPending
                }
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 150,
                  },
                }}
              >
                {updateProfileMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Card>

      <BrokerConnectionCard />

      {/* Trading preferences */}
      <Card
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
          }}
        >
          Trading Preferences
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Your risk profile and trading preferences will
          be configured here.
        </Typography>

        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <AutoGraphPlaceholder />
        </Box>
      </Card>
    </Box>
  );
}

function AutoGraphPlaceholder() {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
    >
      Trading preferences coming soon
    </Typography>
  );
}