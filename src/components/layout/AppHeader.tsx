import {
  AccountCircleOutlined,
  MenuOutlined,
  NotificationsNoneOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

interface AppHeaderProps {
  sidebarWidth?: number;
  onMenuClick: () => void;
}

export default function AppHeader({
  sidebarWidth = 250,
  onMenuClick,
}: AppHeaderProps) {
  const navigate = useNavigate();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const user = useAuthStore((state) => state.user);

  const initials =
    user?.fullName
      ?.split(" ")
      .map((name) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "Q";

  return (
    <Box
      component="header"
      sx={{
        height: 72,
        position: "fixed",
        top: 0,
        right: 0,
        left: {
          xs: 0,
          md: sidebarWidth,
        },
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: {
          xs: 1.5,
          sm: 2,
          md: 3,
        },
        backgroundColor: "background.default",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Mobile menu */}
      {isMobile ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconButton
            onClick={onMenuClick}
            size="small"
            sx={{
              color: "text.primary",
            }}
          >
            <MenuOutlined />
          </IconButton>

          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Quantora
            <Box
              component="span"
              sx={{
                color: "primary.main",
              }}
            >
              .
            </Box>
          </Typography>
        </Box>
      ) : (
        <Box />
      )}

      {/* Right side */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <IconButton
          size="small"
          sx={{
            color: "text.secondary",
          }}
        >
          <NotificationsNoneOutlined />
        </IconButton>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: {
              xs: 0.5,
              sm: 1,
            },
          }}
        />

        <Box
          onClick={() => navigate("/profile")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: {
              xs: 0,
              sm: 1.5,
            },
            cursor: "pointer",
            px: {
              xs: 0.5,
              sm: 1,
            },
            py: 0.5,
            borderRadius: 2,

            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            },
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: 13,
              fontWeight: 700,
              backgroundColor: "primary.main",
              color: "common.black",
            }}
          >
            {initials}
          </Avatar>

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {user?.fullName || "Quantora User"}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              View profile
            </Typography>
          </Box>

          <AccountCircleOutlined
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
              color: "text.secondary",
              fontSize: 20,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}