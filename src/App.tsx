import { Box, CircularProgress } from "@mui/material";

import AppRoutes from "./routes/AppRoutes";
import { useAuthInitialization } from "./features/auth/hooks/uesAuthInitialization.ts";
import { useAuthStore } from "./store/auth.store";

function App() {
  useAuthInitialization();

  const isLoading = useAuthStore(
    (state) => state.isLoading,
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <AppRoutes />;
}

export default App;