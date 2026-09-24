import {
  AccountBalanceOutlined,
  LinkOffOutlined,
  LinkOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import {
  getApiErrorMessage,
  useBrokerConnection,
  useConnectBroker,
  useDisconnectBroker,
} from "../../../features/broker/hooks/useBroker";

export default function BrokerConnectionCard() {
  const {
    data: connection,
    isLoading,
    isError,
    refetch,
  } = useBrokerConnection();

  const connectMutation = useConnectBroker();
  const disconnectMutation = useDisconnectBroker();

  const handleConnect = async () => {
    try {
      const result = await connectMutation.mutateAsync();
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to start the Upstox connection. Please try again.",
        ),
      );
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      toast.success("Upstox has been disconnected.");
    } catch {
      toast.error("Unable to disconnect Upstox. Please try again.");
    }
  };

  const connectedAt = connection?.connectedAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(connection.connectedAt))
    : null;

  return (
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
        <AccountBalanceOutlined color="primary" />

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Broker Connection
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Connect Upstox to sync holdings and place trades.
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress size={28} />
        </Box>
      ) : isError || !connection ? (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Unable to load your broker connection status.
          </Typography>
          <Button variant="outlined" onClick={() => refetch()}>
            Retry
          </Button>
        </Stack>
      ) : (
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: "wrap",
                gap: 1,
                mb: 1,
              }}
            >
              <Chip size="small" label={connection.broker} variant="outlined" />
              <Chip
                size="small"
                color={connection.isConnected ? "success" : "default"}
                label={connection.isConnected ? "Connected" : "Not connected"}
                variant="outlined"
              />
              <Chip
                size="small"
                label={connection.environment}
                variant="outlined"
              />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {connection.isConnected
                ? [
                    connection.brokerUserName
                      ? `Linked as ${connection.brokerUserName}`
                      : "Upstox account linked",
                    connectedAt ? `on ${connectedAt}` : null,
                  ]
                    .filter(Boolean)
                    .join(" ")
                : "Connect your Upstox account to enable trading features."}
            </Typography>
          </Box>

          {connection.isConnected ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={
                disconnectMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <LinkOffOutlined />
                )
              }
              disabled={disconnectMutation.isPending}
              onClick={handleDisconnect}
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 160,
                },
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={
                connectMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <LinkOutlined />
                )
              }
              disabled={connectMutation.isPending}
              onClick={handleConnect}
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 180,
                },
              }}
            >
              {connectMutation.isPending ? "Connecting..." : "Connect Upstox"}
            </Button>
          )}
        </Stack>
      )}
    </Card>
  );
}
