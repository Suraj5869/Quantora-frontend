import { Box } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

const SIDEBAR_WIDTH = 250;
const HEADER_HEIGHT = 72;

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenMobileMenu = () => {
    setMobileOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <AppSidebar
        width={SIDEBAR_WIDTH}
        mobileOpen={mobileOpen}
        onMobileClose={handleCloseMobileMenu}
      />

      <AppHeader
        sidebarWidth={SIDEBAR_WIDTH}
        onMenuClick={handleOpenMobileMenu}
      />

      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            md: `${SIDEBAR_WIDTH}px`,
          },
          pt: `${HEADER_HEIGHT}px`,
          minHeight: "100vh",
          width: {
            xs: "100%",
            md: `calc(100% - ${SIDEBAR_WIDTH}px)`,
          },
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
              md: 3,
              lg: 4,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}