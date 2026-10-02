import {
  AddCircleOutlined,
  ArrowForwardRounded,
  SecurityOutlined,
} from "@mui/icons-material";

import {
  Box,
  Card,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import BrokerConnectionCard from "../../pages/profile/components/BrokerConnectionCard.tsx";

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { BROKER_CONNECTION_QUERY_KEY } from "../../features/broker/hooks/useBroker";

export default function BrokersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
const queryClient = useQueryClient();

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

  setSearchParams(nextParams, {
    replace: true,
  });
}, [
  queryClient,
  searchParams,
  setSearchParams,
]);

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
      }}
    >
      {/* Header */}
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
          Brokers
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mt: 0.75,
            maxWidth: 700,
          }}
        >
          Connect your brokerage accounts to access market data,
          portfolio information, and trading features through Quantora.
        </Typography>
      </Box>

      {/* Security information */}
      <Card
        sx={{
          mb: 3,
          p: {
            xs: 2,
            sm: 2.5,
          },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <Stack
  direction="row"
  spacing={1.5}
  sx={{
    alignItems: "flex-start",
  }}
>
          <SecurityOutlined color="primary" />

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
            >
              Secure broker connections
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.35 }}
            >
              Quantora keeps broker credentials protected and uses
              authenticated connections for broker data and actions.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Upstox */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
            color: "text.secondary",
          }}
        >
          Available Brokers
        </Typography>

        <Box sx={{ mt: 1.5 }}>
          <BrokerConnectionCard />
        </Box>
      </Box>

      {/* Future brokers */}
      <Card
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <Stack
  direction={{
    xs: "column",
    sm: "row",
  }}
  spacing={2}
  sx={{
    alignItems: {
      xs: "flex-start",
      sm: "center",
    },
  }}
>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "action.hover",
              flexShrink: 0,
            }}
          >
            <AddCircleOutlined color="primary" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              More broker integrations
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Additional brokers will be added as Quantora expands
              its trading ecosystem.
            </Typography>
          </Box>

          <Chip
            label="Coming Soon"
            size="small"
            variant="outlined"
            icon={<ArrowForwardRounded />}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="caption"
          color="text.secondary"
        >
          Broker selection and account permissions will remain
          isolated per user.
        </Typography>
      </Card>
    </Box>
  );
}