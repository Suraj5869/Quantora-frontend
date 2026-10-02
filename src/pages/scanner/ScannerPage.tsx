import { useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, MenuItem,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from "@mui/material";
import RadarOutlined from "@mui/icons-material/RadarOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import { getMarketDiscovery, getTechnicalAnalysis } from "../../features/market-data/api/marketData.api";
import type { MarketMover, TechnicalAnalysisResponse } from "../../features/market-data/types/marketData.types";

type ScanRow = { stock: MarketMover; analysis: TechnicalAnalysisResponse | null; error?: string };
type FilterMode = "all" | "bullish" | "bearish" | "oversold" | "overbought" | "positive-momentum";
const dateString = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const money = (v: number | null) => v == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
const val = (v: number | null, digits = 2) => v == null ? "—" : v.toFixed(digits);

export default function ScannerPage() {
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const runScan = async () => {
    setScanning(true); setProgress(0); setError(""); setRows([]);
    try {
      const discovery = await getMarketDiscovery();
      const universe = discovery.featuredStocks;
      const end = new Date();
      const start = new Date(Date.now() - 120 * 86400000);
      const results: ScanRow[] = [];
      // Small batches help avoid overwhelming the broker's market-data API.
      for (let i = 0; i < universe.length; i += 3) {
        const batch = universe.slice(i, i + 3);
        const batchResults = await Promise.all(batch.map(async (stock): Promise<ScanRow> => {
          try {
            const analysis = await getTechnicalAnalysis({
              instrumentKey: stock.instrumentKey, unit: "days", interval: 1, intraday: false,
              fromDate: dateString(start), toDate: dateString(end),
            });
            return { stock, analysis };
          } catch {
            return { stock, analysis: null, error: "Analysis unavailable" };
          }
        }));
        results.push(...batchResults);
        setRows([...results]);
        setProgress(Math.min(100, Math.round(results.length / universe.length * 100)));
      }
      if (results.every(r => !r.analysis)) setError("No indicators could be calculated. Confirm your Upstox connection and try again.");
    } catch {
      setError("Unable to load the scanner universe. Confirm your Upstox connection and try again.");
    } finally { setScanning(false); }
  };
  const visibleRows = rows.filter(({ analysis }) => {
    if (!analysis) return filter === "all";
    switch (filter) {
      case "bullish": return analysis.trend === "Bullish";
      case "bearish": return analysis.trend === "Bearish";
      case "oversold": return analysis.rsi14 != null && analysis.rsi14 <= 30;
      case "overbought": return analysis.rsi14 != null && analysis.rsi14 >= 70;
      case "positive-momentum": return analysis.momentum === "Positive";
      default: return true;
    }
  });
  const successful = rows.filter(r => r.analysis);
  return <Box sx={{ maxWidth: 1500, mx: "auto" }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
      <Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <RadarOutlined color="primary" />
          <Typography variant="h4" fontWeight={800}>Stock Scanner</Typography>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Screen the featured NSE universe using daily technical indicators.</Typography>
      </Box>
      <Button variant="contained" startIcon={scanning ? <CircularProgress size={18} color="inherit" /> : <RefreshOutlined />} disabled={scanning} onClick={() => void runScan()}>{scanning ? `Scanning ${progress}%` : rows.length ? "Run scan again" : "Run scanner"}</Button>
    </Stack>
    <Alert severity="info" sx={{ mb: 2 }}>This first scanner checks the 20 featured stocks already configured in Quantora. It uses daily candles and historical indicators; results are screening signals, not buy/sell recommendations.</Alert>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" }, gap: 1.5, mb: 2 }}>
      <Summary title="Stocks scanned" value={String(successful.length)} />
      <Summary title="Bullish trend" value={String(successful.filter(r => r.analysis?.trend === "Bullish").length)} />
      <Summary title="Oversold (RSI ≤ 30)" value={String(successful.filter(r => r.analysis?.rsi14 != null && r.analysis.rsi14 <= 30).length)} />
      <Summary title="Positive momentum" value={String(successful.filter(r => r.analysis?.momentum === "Positive").length)} />
    </Box>
    <Card variant="outlined">
      <CardContent sx={{ pb: "12px !important" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1}>
          <Typography variant="h6" fontWeight={750}>Scan results</Typography>
          <TextField select size="small" label="Filter results" value={filter} onChange={e => setFilter(e.target.value as FilterMode)} sx={{ minWidth: 210 }}>
            <MenuItem value="all">All scanned stocks</MenuItem><MenuItem value="bullish">Bullish trend</MenuItem>
            <MenuItem value="bearish">Bearish trend</MenuItem><MenuItem value="oversold">RSI oversold (≤ 30)</MenuItem>
            <MenuItem value="overbought">RSI overbought (≥ 70)</MenuItem><MenuItem value="positive-momentum">Positive momentum</MenuItem>
          </TextField>
        </Stack>
      </CardContent>
      {rows.length === 0 && !scanning ? <Box sx={{ p: 5, textAlign: "center" }}><RadarOutlined sx={{ fontSize: 42, color: "text.secondary", mb: 1 }} /><Typography fontWeight={650}>Ready to scan</Typography><Typography color="text.secondary" variant="body2">Run the scanner to calculate daily indicators for featured stocks.</Typography></Box> :
      <TableContainer sx={{ overflowX: "auto" }}><Table size="small">
        <TableHead><TableRow>{["Stock","Last price","Trend","RSI (14)","MACD","SMA 20","Momentum","Volatility"].map(h => <TableCell key={h} sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{visibleRows.map(({ stock, analysis, error: rowError }) => <TableRow key={stock.instrumentKey} hover>
          <TableCell sx={{ minWidth: 170 }}><Typography fontWeight={700}>{stock.tradingSymbol}</Typography><Typography variant="caption" color="text.secondary">{stock.name}</Typography></TableCell>
          <TableCell>{money(stock.lastPrice)}</TableCell>
          <TableCell>{analysis ? <Chip size="small" label={analysis.trend} color={analysis.trend === "Bullish" ? "success" : analysis.trend === "Bearish" ? "error" : "default"} /> : <Typography variant="body2" color="text.secondary">{rowError ?? "Waiting…"}</Typography>}</TableCell>
          <TableCell>{val(analysis?.rsi14 ?? null)}{analysis?.rsi14 != null && (analysis.rsi14 <= 30 || analysis.rsi14 >= 70) ? <Chip size="small" sx={{ ml: 0.5 }} label={analysis.rsi14 <= 30 ? "Oversold" : "Overbought"} /> : null}</TableCell>
          <TableCell>{val(analysis?.macd ?? null, 3)}</TableCell><TableCell>{money(analysis?.sma20 ?? null)}</TableCell>
          <TableCell>{analysis?.momentum ?? "—"}</TableCell><TableCell>{analysis?.volatility ?? "—"}</TableCell>
        </TableRow>)}</TableBody>
      </Table></TableContainer>}
      {scanning && <Box sx={{ p: 2 }}><Typography variant="body2" color="text.secondary">Processed {rows.length} stocks so far. Some instruments may not return enough daily candles to calculate every indicator.</Typography></Box>}
    </Card>
  </Box>;
}

function Summary({ title, value }: { title: string; value: string }) {
  return <Card variant="outlined"><CardContent><Typography variant="body2" color="text.secondary">{title}</Typography><Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>{value}</Typography></CardContent></Card>;
}
