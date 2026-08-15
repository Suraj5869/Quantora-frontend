import {
  AccountBalanceOutlined,
  AutoGraphOutlined,
  BarChartOutlined,
  DashboardOutlined,
  InsightsOutlined,
  LogoutOutlined,
  Person4Outlined,
  PersonOutlined,
  SettingsOutlined,
  ShowChartOutlined,
  StarBorderOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardOutlined />,
  },
  {
    label: "Portfolio",
    path: "/portfolio",
    icon: <AccountBalanceOutlined />,
  },
  {
    label: "Watchlist",
    path: "/watchlist",
    icon: <StarBorderOutlined />,
  },
  {
    label: "Strategies",
    path: "/strategies",
    icon: <AutoGraphOutlined />,
  },
  {
    label: "AI Insights",
    path: "/ai-insights",
    icon: <InsightsOutlined />,
  },
];

const tradingItems = [
  {
    label: "Paper Trading",
    path: "/paper-trading",
    icon: <ShowChartOutlined />,
  },
  {
    label: "Markets",
    path: "/markets",
    icon: <BarChartOutlined />,
  },
];

const bottomItems = [
  {
    label: "Profile",
    path: "/profile",
    icon: <Person4Outlined />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsOutlined />,
  },
];

interface AppSidebarProps {
  width?: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AppSidebar({
  width = 250,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const logout = useAuthStore((state) => state.logout);

  const handleNavigation = (path: string) => {
    navigate(path);

    if (isMobile) {
      onMobileClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });

    if (isMobile) {
      onMobileClose();
    }
  };

  const renderNavigationItem = (
    item: (typeof navigationItems)[number],
  ) => {
    const isActive =
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`);

    return (
      <ListItemButton
        key={item.path}
        selected={isActive}
        onClick={() => handleNavigation(item.path)}
        sx={{
          minHeight: 46,
          px: 2,
          mb: 0.5,
          borderRadius: 2,

          "& .MuiListItemIcon-root": {
            minWidth: 38,
          },

          "&.Mui-selected": {
            backgroundColor: "rgba(255, 215, 0, 0.10)",

            "& .MuiListItemIcon-root": {
              color: "primary.main",
            },

            "& .MuiListItemText-primary": {
              color: "primary.main",
              fontWeight: 600,
            },
          },

          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>

        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              sx:{
              fontSize: 14,
              }
            },
          }}
        />
      </ListItemButton>
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          height: 72,
          px: 3,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "text.primary",
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

      <Divider />

      {/* Overview */}
      <Box sx={{ px: 1.5, pt: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 1,
            color: "text.secondary",
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          OVERVIEW
        </Typography>

        <List sx={{ mt: 1 }}>
          {navigationItems.map(renderNavigationItem)}
        </List>
      </Box>

      {/* Trading */}
      <Box sx={{ px: 1.5, mt: 1 }}>
        <Typography
          variant="caption"
          sx={{
            px: 1,
            color: "text.secondary",
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          TRADING
        </Typography>

        <List sx={{ mt: 1 }}>
          {tradingItems.map(renderNavigationItem)}
        </List>
      </Box>

      {/* Bottom */}
      <Box sx={{ mt: "auto", px: 1.5, pb: 1 }}>
        <Divider sx={{ mb: 1 }} />

        <List>
          {bottomItems.map(renderNavigationItem)}

          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 46,
              px: 2,
              borderRadius: 2,

              "& .MuiListItemIcon-root": {
                minWidth: 38,
              },

              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <ListItemIcon>
              <LogoutOutlined />
            </ListItemIcon>

            <ListItemText
              primary="Logout"
              slotProps={{
                primary: {
                  sx: {
                  fontSize: 14,
                  }
                },
              }}
            />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Box
      component="aside"
      sx={{
        width,
        flexShrink: 0,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1200,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      {sidebarContent}
    </Box>
  );
}