import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import ShowChartOutlined from "@mui/icons-material/ShowChartOutlined";
import { getHistoricalCandles, getIntradayCandles } from "../../features/market-data/api/marketData.api";
import type { MarketCandlesResponse } from "../../features/market-data/types/marketData.types";

type DataMode = "intraday" | "historical";

const today = new Date().toISOString().slice(0, 10);
const defaultFromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default function MarketsPage() {
  const [instrumentKey, setInstrumentKey] = useState("");
  const [mode, setMode] = useState<DataMode>("intraday");
  const [unit, setUnit] = useState("minutes");
  const [interval, setInterval] = useState(1);
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(today);
  const [data, setData] = useState<MarketCandlesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCandles = async (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    setData(null);

    if (!instrumentKey.trim()) {
      setError("Enter an Upstox instrument key, for example NSE_EQ|INE669E01016.");
      return;
    }

    if (mode === "historical" && fromDate > toDate) {
      setError("The start date must be on or before the end date.");
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === "intraday"
          ? await getIntradayCandles({
              instrumentKey: instrumentKey.trim(),
              unit,
              interval,
            })
          : await getHistoricalCandles({
              instrumentKey: instrumentKey.trim(),
              unit,
              interval,
              fromDate,
              toDate,
            });

      setData(result);
    } catch (requestError: unknown) {
      const responseData =
        typeof requestError === "object" &&
        requestError !== null &&
        "response" in requestError
          ? (requestError as {
              response?: { data?: { message?: string; errors?: string[] } };
            }).response?.data
          : undefined;
      setError(
        responseData?.message ??
          responseData?.errors?.[0] ??
          "Unable to load market data. Check that the backend is running and your Upstox account is connected.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.7px" }}>
            Markets
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Explore OHLCV candles from your connected Upstox account.
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshOutlined />}
          variant="outlined"
          onClick={() => void loadCandles()}
          disabled={loading || !instrumentKey.trim()}
        >
          Refresh data
        </Button>
      </Stack>

      <Card
        component="form"
        onSubmit={(event) => void loadCandles(event)}
        sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider", backgroundImage: "none" }}
      >
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Upstox instrument key"
              value={instrumentKey}
              onChange={(event) => setInstrumentKey(event.target.value)}
              placeholder="NSE_EQ|INE669E01016"
              helperText="Use the exact instrument key from the Upstox instrument master."
              fullWidth
              required
            />
            <TextField
              select
              label="Data range"
              value={mode}
              onChange={(event) => setMode(event.target.value as DataMode)}
              sx={{ minWidth: { md: 190 } }}
            >
              <MenuItem value="intraday">Current day</MenuItem>
              <MenuItem value="historical">Historical range</MenuItem>
            </TextField>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Candle unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              fullWidth
            >
              <MenuItem value="minutes">Minutes</MenuItem>
              <MenuItem value="hours">Hours</MenuItem>
              <MenuItem value="days">Days</MenuItem>
            </TextField>
            <TextField
              label="Interval"
              type="number"
              value={interval}
              onChange={(event) => setInterval(Number(event.target.value))}
              slotProps={{ htmlInput: { min: 1 } }}
              fullWidth
            />
            {mode === "historical" && (
              <>
                <TextField
                  label="From date"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <TextField
                  label="To date"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
              </>
            )}
          </Stack>

          <Box>
            <Button type="submit" variant="contained" startIcon={<ShowChartOutlined />} disabled={loading}>
              {loading ? "Loading candles…" : "Load market data"}
            </Button>
          </Box>
        </Stack>
      </Card>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 7 }}>
          <CircularProgress />
        </Box>
      )}

      {data && !loading && (
        <Box sx={{ mt: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {data.instrumentKey}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.candles.length} candles · {data.unit} / {data.interval}
                {data.fromDate && data.toDate ? ` · ${data.fromDate} to ${data.toDate}` : ""}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Retrieved {formatTimestamp(data.fetchedAt)}
            </Typography>
          </Stack>

          {data.candles.length === 0 ? (
            <Alert severity="info">
              No candles were returned for this instrument and range. Check the instrument key, interval, and market-data access.
            </Alert>
          ) : (
            <TableContainer component={Card} sx={{ border: "1px solid", borderColor: "divider", backgroundImage: "none" }}>
              <Table size="small" aria-label="Market candles">
                <TableHead>
                  <TableRow>
                    <TableCell>Time (IST)</TableCell>
                    <TableCell align="right">Open</TableCell>
                    <TableCell align="right">High</TableCell>
                    <TableCell align="right">Low</TableCell>
                    <TableCell align="right">Close</TableCell>
                    <TableCell align="right">Volume</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...data.candles].reverse().map((candle) => (
                    <TableRow key={candle.timestamp} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{formatTimestamp(candle.timestamp)}</TableCell>
                      <TableCell align="right">{formatPrice(candle.open)}</TableCell>
                      <TableCell align="right">{formatPrice(candle.high)}</TableCell>
                      <TableCell align="right">{formatPrice(candle.low)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: candle.close >= candle.open ? "success.main" : "error.main", fontWeight: 600 }}
                      >
                        {formatPrice(candle.close)}
                      </TableCell>
                      <TableCell align="right">{candle.volume.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}
