import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Alert, Box, Button, Card, CardActionArea, Chip, CircularProgress, Divider,
  InputAdornment, MenuItem, Stack, Tab, Tabs, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlined from "@mui/icons-material/TrendingDownOutlined";
import ShowChartOutlined from "@mui/icons-material/ShowChartOutlined";
import { getHistoricalCandles, getIntradayCandles, getMarketDiscovery, searchStocks } from "../../features/market-data/api/marketData.api";
import type { MarketCandlesResponse, MarketDiscoveryResponse, MarketInstrument, MarketMover } from "../../features/market-data/types/marketData.types";

type DataMode = "intraday" | "historical";
const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const defaultFromDate = new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const price = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const formatTime = (v: string) => new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const formatNumber = (v: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);
function getError(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: { message?: string; errors?: string[] } } }).response?.data;
    return data?.message ?? data?.errors?.[0] ?? "Unable to load market data.";
  }
  return "Unable to load market data. Check that your Upstox account is connected and try again.";
}

export default function MarketsPage() {
  const [discovery, setDiscovery] = useState<MarketDiscoveryResponse | null>(null);
  const [loadingDiscovery, setLoadingDiscovery] = useState(true);
  const [pageError, setPageError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MarketInstrument[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<MarketInstrument | MarketMover | null>(null);
  const [mode, setMode] = useState<DataMode>("intraday");
  const [unit, setUnit] = useState("minutes");
  const [interval, setInterval] = useState(1);
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(today);
  const [candles, setCandles] = useState<MarketCandlesResponse | null>(null);
  const [loadingCandles, setLoadingCandles] = useState(false);
  const [candleError, setCandleError] = useState("");

  const refresh = useCallback(async () => {
    setLoadingDiscovery(true); setPageError("");
    try { setDiscovery(await getMarketDiscovery()); }
    catch (error) { setPageError(getError(error)); }
    finally { setLoadingDiscovery(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (query.trim().length < 2 || (selected && query === selected.name + " (" + selected.tradingSymbol + ")")) {
      setResults([]); setSearching(false); return;
    }
    let active = true;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try { const data = await searchStocks(query.trim()); if (active) setResults(data); }
      catch (error) { if (active) setPageError(getError(error)); }
      finally { if (active) setSearching(false); }
    }, 300);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, selected]);

  const loadCandles = async (stock: MarketInstrument | MarketMover, nextMode = mode, nextUnit = unit, nextInterval = interval, from = fromDate, to = toDate) => {
    if (nextMode === "historical" && from > to) { setCandleError("Start date must be on or before end date."); return; }
    setLoadingCandles(true); setCandleError("");
    try {
      const data = nextMode === "intraday"
        ? await getIntradayCandles({ instrumentKey: stock.instrumentKey, unit: nextUnit, interval: nextInterval })
        : await getHistoricalCandles({ instrumentKey: stock.instrumentKey, unit: nextUnit, interval: nextInterval, fromDate: from, toDate: to });
      setCandles(data);
    } catch (error) { setCandleError(getError(error)); }
    finally { setLoadingCandles(false); }
  };
  const chooseStock = (stock: MarketInstrument | MarketMover) => {
    setSelected(stock); setCandles(null); setCandleError(""); setResults([]);
    setQuery(stock.name + " (" + stock.tradingSymbol + ")");
    void loadCandles(stock);
  };
  const submitSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (results[0]) { chooseStock(results[0]); return; }
    if (query.trim().length < 2) return;
    setSearching(true);
    try { const data = await searchStocks(query.trim()); setResults(data); if (data[0]) chooseStock(data[0]); }
    catch (error) { setPageError(getError(error)); }
    finally { setSearching(false); }
  };

  return <Box sx={{ pb: 4 }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 3 }}>
      <Box><Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.7px" }}>Markets</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>Search Indian stocks and explore market movers and price history.</Typography></Box>
      <Button startIcon={<RefreshOutlined />} variant="outlined" onClick={() => void refresh()} disabled={loadingDiscovery}>Refresh market</Button>
    </Stack>

    <Card component="form" onSubmit={(e) => void submitSearch(e)} sx={{ p: { xs: 2, md: 2.5 }, mb: 3, border: "1px solid", borderColor: "divider", backgroundImage: "none" }}>
      <TextField fullWidth value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null); setCandles(null); }}
        placeholder="Search company name or symbol — e.g. Reliance, TCS, INFY" aria-label="Search stocks by company name or symbol"
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment>, endAdornment: searching ? <CircularProgress size={18} /> : undefined }} />
      {results.length > 0 && <Stack spacing={0} sx={{ mt: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        {results.map((stock) => <Box key={stock.instrumentKey}><Button fullWidth onClick={() => chooseStock(stock)} sx={{ justifyContent: "flex-start", textAlign: "left", px: 2, py: 1.25, borderRadius: 0, color: "text.primary" }}>
          <Box sx={{ minWidth: 0, flex: 1 }}><Typography fontWeight={700}>{stock.name}</Typography><Typography variant="caption" color="text.secondary">{stock.exchange} · {stock.tradingSymbol}</Typography></Box><ShowChartOutlined />
        </Button><Divider /></Box>)}
      </Stack>}
      {query.trim().length >= 2 && !searching && results.length === 0 && !selected && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No matching NSE equity found. Try a company name or trading symbol.</Typography>}
    </Card>

    {pageError && <Alert severity="warning" sx={{ mb: 2 }}>{pageError}</Alert>}
    {loadingDiscovery && !discovery && <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress /></Box>}
    {discovery && <>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1, p: 2.5, border: "1px solid", borderColor: "divider", backgroundImage: "none" }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}><TrendingUpOutlined color="success" /><Typography variant="h6" fontWeight={750}>Top gainers</Typography></Stack>
          {discovery.topGainers.length ? discovery.topGainers.map((s) => <MoverRow key={s.instrumentKey} stock={s} positive onSelect={chooseStock} />) : <Typography color="text.secondary" variant="body2">No positive movers in the featured list right now.</Typography>}
        </Card>
        <Card sx={{ flex: 1, p: 2.5, border: "1px solid", borderColor: "divider", backgroundImage: "none" }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}><TrendingDownOutlined color="error" /><Typography variant="h6" fontWeight={750}>Top losers</Typography></Stack>
          {discovery.topLosers.length ? discovery.topLosers.map((s) => <MoverRow key={s.instrumentKey} stock={s} positive={false} onSelect={chooseStock} />) : <Typography color="text.secondary" variant="body2">No negative movers in the featured list right now.</Typography>}
        </Card>
      </Stack>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Box><Typography variant="h6" fontWeight={750}>Popular NSE stocks</Typography><Typography variant="body2" color="text.secondary">Choose a stock to open its candle history.</Typography></Box>
          <Chip size="small" label="NSE equity" variant="outlined" />
        </Stack>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }, gap: 1.5 }}>
          {discovery.featuredStocks.map((stock) => <Card key={stock.instrumentKey} sx={{ border: "1px solid", borderColor: selected?.instrumentKey === stock.instrumentKey ? "primary.main" : "divider", backgroundImage: "none" }}>
            <CardActionArea onClick={() => chooseStock(stock)} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}><Box sx={{ minWidth: 0 }}><Typography fontWeight={750} noWrap>{stock.name}</Typography><Typography variant="caption" color="text.secondary">{stock.tradingSymbol}</Typography></Box><ShowChartOutlined fontSize="small" color="action" /></Stack>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 1.25 }}>{price(stock.lastPrice)}</Typography>
              <Typography variant="body2" sx={{ color: stock.changePercent >= 0 ? "success.main" : "error.main", fontWeight: 700 }}>{stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}% ({stock.netChange >= 0 ? "+" : ""}{price(stock.netChange)})</Typography>
            </CardActionArea>
          </Card>)}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">Quotes fetched {formatTime(discovery.fetchedAt)}. Gainers and losers are ranked within the featured stock list, not the entire NSE.</Typography>
    </>}

    {selected && <Card sx={{ mt: 3, p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider", backgroundImage: "none" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box><Typography variant="h5" fontWeight={800}>{selected.name}</Typography><Typography color="text.secondary">{selected.tradingSymbol} · NSE Equity</Typography></Box>
        <Stack direction="row" spacing={1} alignItems="center"><Tabs value={mode} onChange={(_, v: DataMode) => { setMode(v); void loadCandles(selected, v); }} aria-label="Candle range"><Tab label="Intraday" value="intraday" /><Tab label="Historical" value="historical" /></Tabs>
          <Button variant="outlined" startIcon={<RefreshOutlined />} disabled={loadingCandles} onClick={() => void loadCandles(selected)}>Refresh</Button></Stack>
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField select size="small" label="Candle unit" value={unit} onChange={(e) => { setUnit(e.target.value); void loadCandles(selected, mode, e.target.value); }} sx={{ minWidth: 140 }}>
          <MenuItem value="minutes">Minutes</MenuItem><MenuItem value="hours">Hours</MenuItem><MenuItem value="days">Days</MenuItem>
        </TextField>
        <TextField size="small" label="Interval" type="number" value={interval} onChange={(e) => setInterval(Number(e.target.value))} inputProps={{ min: 1 }} sx={{ width: 120 }} />
        {mode === "historical" && <><TextField size="small" label="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} /><TextField size="small" label="To" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} /></>}
        <Button variant="contained" disabled={loadingCandles} onClick={() => void loadCandles(selected)}>Load candles</Button>
      </Stack>
      {candleError && <Alert severity="error" sx={{ mb: 2 }}>{candleError}</Alert>}
      {loadingCandles && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}
      {candles && !loadingCandles && (candles.candles.length === 0 ? <Alert severity="info">No candles available for this stock and date range.</Alert> :
        <TableContainer sx={{ maxHeight: 480, border: "1px solid", borderColor: "divider", borderRadius: 2 }}><Table size="small" stickyHeader>
          <TableHead><TableRow><TableCell>Time (IST)</TableCell><TableCell align="right">Open</TableCell><TableCell align="right">High</TableCell><TableCell align="right">Low</TableCell><TableCell align="right">Close</TableCell><TableCell align="right">Volume</TableCell></TableRow></TableHead>
          <TableBody>{[...candles.candles].reverse().map((c) => <TableRow key={c.timestamp} hover><TableCell sx={{ whiteSpace: "nowrap" }}>{formatTime(c.timestamp)}</TableCell><TableCell align="right">{price(c.open)}</TableCell><TableCell align="right">{price(c.high)}</TableCell><TableCell align="right">{price(c.low)}</TableCell><TableCell align="right" sx={{ color: c.close >= c.open ? "success.main" : "error.main", fontWeight: 650 }}>{price(c.close)}</TableCell><TableCell align="right">{formatNumber(c.volume)}</TableCell></TableRow>)}</TableBody>
        </Table></TableContainer>)}
    </Card>}
  </Box>;
}

function MoverRow({ stock, onSelect, positive }: { stock: MarketMover; onSelect: (stock: MarketMover) => void; positive: boolean }) {
  return <Button fullWidth onClick={() => onSelect(stock)} sx={{ justifyContent: "flex-start", textAlign: "left", px: 1, py: 1.25, color: "text.primary", borderRadius: 1 }}>
    <Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={700} noWrap>{stock.tradingSymbol}</Typography><Typography variant="caption" color="text.secondary" noWrap>{stock.name}</Typography></Box>
    <Box sx={{ textAlign: "right", ml: 1 }}><Typography variant="body2" fontWeight={700}>{price(stock.lastPrice)}</Typography><Typography variant="caption" sx={{ color: positive ? "success.main" : "error.main", fontWeight: 700 }}>{stock.changePercent > 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%</Typography></Box>
  </Button>;
}
