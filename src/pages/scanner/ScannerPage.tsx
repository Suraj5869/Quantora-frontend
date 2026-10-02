import { useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, MenuItem,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";
import RadarOutlined from "@mui/icons-material/RadarOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import apiClient from "../../api/axios";

type StrategyScanItem = {
  name: string;
  tradingSymbol: string;
  instrumentKey: string;
  lastClose: number | null;
  dailyChangePercent: number | null;
  rsi14: number | null;
  setup: string;
  note: string;
  candleCount: number;
};
type StrategyScanResponse = {
  scannedAt: string;
  universeSize: number;
  successfulResults: number;
  results: StrategyScanItem[];
  scopeAndDisclaimer: string;
};
type FilterMode = "all" | "bullish" | "bearish" | "mixed" | "unavailable";
const money = (v: number | null) => v == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
const val = (v: number | null, digits = 2) => v == null ? "—" : v.toFixed(digits);

export default function ScannerPage() {
  const [result, setResult] = useState<StrategyScanResponse | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const runScan = async () => {
    setScanning(true);
    setError("");
    try {
      const response = await apiClient.get<StrategyScanResponse>("/strategy-scanner/scan");
      setResult(response.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; title?: string } } };
      setError(err.response?.data?.message ?? err.response?.data?.title ??
        "Unable to scan stocks. Confirm your Upstox connection and try again.");
    } finally {
      setScanning(false);
    }
  };

  const rows = (result?.results ?? []).filter(row => {
    switch (filter) {
      case "bullish": return row.setup === "Bullish setup";
      case "bearish": return row.setup === "Bearish setup";
      case "mixed": return row.setup === "Mixed signals";
      case "unavailable": return row.setup === "Unavailable" || row.setup === "Insufficient data";
      default: return true;
    }
  });
  const allRows = result?.results ?? [];
  const count = (setup: string) => allRows.filter(row => row.setup === setup).length;

  return <Box sx={{ maxWidth: 1500, mx: "auto" }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
      <Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <RadarOutlined color="primary" />
          <Typography variant="h4" fontWeight={800}>Stock Scanner</Typography>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Find technical setups from historical daily market data.</Typography>
      </Box>
      <Button variant="contained" startIcon={scanning ? <CircularProgress size={18} color="inherit" /> : <RefreshOutlined />} disabled={scanning} onClick={() => void runScan()}>
        {scanning ? "Scanning universe…" : result ? "Run scan again" : "Run scanner"}
      </Button>
    </Stack>

    <Alert severity="info" sx={{ mb: 2 }}>
      {result?.scopeAndDisclaimer ?? "The scan uses the currently configured featured-stock universe. Results are informational screening signals, not buy/sell recommendations. No orders are placed."}
    </Alert>
    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" }, gap: 1.5, mb: 2 }}>
      <Summary title="Universe size" value={String(result?.universeSize ?? "—")} />
      <Summary title="Bullish setups" value={String(count("Bullish setup"))} />
      <Summary title="Bearish setups" value={String(count("Bearish setup"))} />
      <Summary title="Unavailable / insufficient" value={String(count("Unavailable") + count("Insufficient data"))} />
    </Box>

    <Card variant="outlined">
      <CardContent sx={{ pb: "12px !important" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1}>
          <Box>
            <Typography variant="h6" fontWeight={750}>Strategy scan results</Typography>
            {result && <Typography variant="caption" color="text.secondary">
              Scanned {new Date(result.scannedAt).toLocaleString("en-IN")} · {result.successfulResults} of {result.universeSize} instruments returned data
            </Typography>}
          </Box>
          <TextField select size="small" label="Filter results" value={filter} onChange={e => setFilter(e.target.value as FilterMode)} sx={{ minWidth: 220 }}>
            <MenuItem value="all">All results</MenuItem>
            <MenuItem value="bullish">Bullish setups</MenuItem>
            <MenuItem value="bearish">Bearish setups</MenuItem>
            <MenuItem value="mixed">Mixed signals</MenuItem>
            <MenuItem value="unavailable">Unavailable / insufficient data</MenuItem>
          </TextField>
        </Stack>
      </CardContent>
      {!result && !scanning ? <Box sx={{ p: 5, textAlign: "center" }}>
        <RadarOutlined sx={{ fontSize: 42, color: "text.secondary", mb: 1 }} />
        <Typography fontWeight={650}>Ready to scan</Typography>
        <Typography color="text.secondary" variant="body2">Run the scanner to analyze the configured universe.</Typography>
      </Box> : scanning && !result ? <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }} color="text.secondary">Fetching historical candles and calculating indicators. This can take a little while.</Typography></Box> :
      <TableContainer sx={{ overflowX: "auto" }}><Table size="small">
        <TableHead><TableRow>{["Stock","Last close","Daily change","Setup","RSI (14)","Candles","Notes"].map(h => <TableCell key={h} sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{rows.map(row => <TableRow key={row.instrumentKey} hover>
          <TableCell sx={{ minWidth: 155 }}><Typography fontWeight={700}>{row.tradingSymbol}</Typography><Typography variant="caption" color="text.secondary">{row.name}</Typography></TableCell>
          <TableCell>{money(row.lastClose)}</TableCell>
          <TableCell sx={{ whiteSpace: "nowrap", color: row.dailyChangePercent == null ? "text.secondary" : row.dailyChangePercent > 0 ? "success.main" : row.dailyChangePercent < 0 ? "error.main" : "text.primary" }}>{row.dailyChangePercent == null ? "—" : `${row.dailyChangePercent > 0 ? "+" : ""}${val(row.dailyChangePercent)}%`}</TableCell>
          <TableCell><Chip size="small" label={row.setup} color={row.setup === "Bullish setup" ? "success" : row.setup === "Bearish setup" ? "error" : row.setup === "Unavailable" ? "warning" : "default"} /></TableCell>
          <TableCell>{val(row.rsi14)}</TableCell>
          <TableCell>{row.candleCount || "—"}</TableCell>
          <TableCell sx={{ minWidth: 280, maxWidth: 480, whiteSpace: "normal" }}><Typography variant="body2" color="text.secondary">{row.note}</Typography></TableCell>
        </TableRow>)}</TableBody>
      </Table></TableContainer>}
      {result && rows.length === 0 && <Box sx={{ p: 3, textAlign: "center" }}><Typography color="text.secondary">No stocks match this filter.</Typography></Box>}
    </Card>
  </Box>;
}

function Summary({ title, value }: { title: string; value: string }) {
  return <Card variant="outlined"><CardContent><Typography variant="body2" color="text.secondary">{title}</Typography><Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>{value}</Typography></CardContent></Card>;
}
