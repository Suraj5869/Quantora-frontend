import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Alert, Box, Button, Card, CardActionArea, Chip, CircularProgress, Divider,
  Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, MenuItem,
  Stack, Tab, Tabs, TextField, Typography,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlined from "@mui/icons-material/TrendingDownOutlined";
import ShowChartOutlined from "@mui/icons-material/ShowChartOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { getHistoricalCandles, getIntradayCandles, getMarketDiscovery, getTechnicalAnalysis, searchStocks } from "../../features/market-data/api/marketData.api";
import type { MarketCandle, MarketCandlesResponse, MarketDiscoveryResponse, MarketInstrument, MarketMover, TechnicalAnalysisResponse } from "../../features/market-data/types/marketData.types";

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
  const [analysis, setAnalysis] = useState<TechnicalAnalysisResponse | null>(null);

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
    setLoadingCandles(true); setCandleError(""); setAnalysis(null);
    try {
      const data = nextMode === "intraday"
        ? await getIntradayCandles({ instrumentKey: stock.instrumentKey, unit: nextUnit, interval: nextInterval })
        : await getHistoricalCandles({ instrumentKey: stock.instrumentKey, unit: nextUnit, interval: nextInterval, fromDate: from, toDate: to });
      setCandles(data);
      try {
        const indicators = await getTechnicalAnalysis({
          instrumentKey: stock.instrumentKey, unit: nextUnit, interval: nextInterval,
          intraday: nextMode === "intraday",
          ...(nextMode === "historical" ? { fromDate: from, toDate: to } : {}),
        });
        setAnalysis(indicators);
      } catch {
        setAnalysis(null);
      }
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

    <Dialog
      open={Boolean(selected)}
      onClose={() => setSelected(null)}
      fullWidth
      maxWidth={false}
      hideBackdrop
      sx={{ "& .MuiDialog-container": { alignItems: "stretch", justifyContent: "stretch" } }}
      PaperProps={{ sx: {
        position: "fixed", top: { xs: "56px", md: "80px" }, left: 0, right: 0, bottom: 0,
        m: "0 !important", width: "100%", maxWidth: "none", height: { xs: "calc(100dvh - 56px)", md: "calc(100dvh - 80px)" },
        maxHeight: "none", borderRadius: 0, backgroundImage: "none", overflow: "hidden",
      } }}
    >
      {selected && <>
        <DialogTitle sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 1 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" fontWeight={800}>{selected.name}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75, flexWrap: "wrap" }}>
                <Chip size="small" label={selected.tradingSymbol} />
                <Typography variant="body2" color="text.secondary">NSE · {selected.instrumentKey}</Typography>
              </Stack>
            </Box>
            <IconButton aria-label="Close stock details" onClick={() => setSelected(null)}><CloseOutlined /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 1.5, md: 3 }, pb: 3, overflowY: "auto", overflowX: "hidden" }}>
          <Stack direction="column" spacing={1.5} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", rowGap: 1 }}>
              <Tabs value={mode} onChange={(_, v: DataMode) => { setMode(v); void loadCandles(selected, v); }} aria-label="Chart range">
                <Tab label="Intraday" value="intraday" />
                <Tab label="Historical" value="historical" />
              </Tabs>
              <Button variant="outlined" size="small" startIcon={<RefreshOutlined />} disabled={loadingCandles} onClick={() => void loadCandles(selected)}>Refresh</Button>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="flex-start">
              <TextField select size="small" label="Candle unit" value={unit} onChange={(e) => { setUnit(e.target.value); void loadCandles(selected, mode, e.target.value); }} sx={{ width: 150, minWidth: 150 }}>
                <MenuItem value="minutes">Minutes</MenuItem><MenuItem value="hours">Hours</MenuItem><MenuItem value="days">Days</MenuItem>
              </TextField>
              <TextField size="small" label="Interval" type="number" value={interval} onChange={(e) => setInterval(Math.max(1, Number(e.target.value) || 1))} inputProps={{ min: 1 }} sx={{ width: 110, minWidth: 110 }} />
              {mode === "historical" && <>
                <TextField size="small" label="From date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 180, minWidth: 165 }} />
                <TextField size="small" label="To date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 180, minWidth: 165 }} />
              </>}
              <Button variant="contained" disabled={loadingCandles} onClick={() => void loadCandles(selected)} sx={{ minHeight: 40, alignSelf: "flex-start" }}>Apply</Button>
            </Stack>
          </Stack>
          {candleError && <Alert severity="error" sx={{ mb: 2 }}>{candleError}</Alert>}
          {loadingCandles && <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>}
          {!loadingCandles && candles && candles.candles.length === 0 && <Alert severity="info">No chart data is available for this stock and date range.</Alert>}
          {!loadingCandles && candles && candles.candles.length > 0 && <>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
              <MetricCard label="Latest close" value={price(candles.candles[candles.candles.length - 1].close)} />
              <MetricCard label="Period high" value={price(Math.max(...candles.candles.map(c => c.high)))} />
              <MetricCard label="Period low" value={price(Math.min(...candles.candles.map(c => c.low)))} />
              <MetricCard label="Latest volume" value={formatNumber(candles.candles[candles.candles.length - 1].volume)} />
            </Stack>
            {analysis && <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={750} sx={{ mb: 1 }}>Technical analysis</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))", xl: "repeat(7, minmax(0, 1fr))" }, gap: 1 }}>
                <MetricCard label="Trend" value={analysis.trend} />
                <MetricCard label="Momentum" value={analysis.momentum} />
                <MetricCard label="RSI (14)" value={analysis.rsi14 == null ? "Need more data" : analysis.rsi14.toFixed(2)} />
                <MetricCard label="SMA (20)" value={analysis.sma20 == null ? "Need more data" : price(analysis.sma20)} />
                <MetricCard label="EMA (20)" value={analysis.ema20 == null ? "Need more data" : price(analysis.ema20)} />
                <MetricCard label="MACD" value={analysis.macd == null ? "Need more data" : analysis.macd.toFixed(3)} />
                <MetricCard label="Volatility" value={analysis.atrPercent == null ? "Need more data" : `${analysis.volatility} (${analysis.atrPercent.toFixed(2)}%)`} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Based on {analysis.candleCount} candles. Indicators describe historical data and are not trading recommendations.
              </Typography>
            </Box>}
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", backgroundColor: "background.paper" }}>
              <Stack direction="row" spacing={2} sx={{ px: 2, pt: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="subtitle2" fontWeight={750}>Price chart</Typography>
                <Stack direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#26a69a" }} /><Typography variant="caption" color="text.secondary">Bullish candle</Typography></Stack>
                <Stack direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#ef5350" }} /><Typography variant="caption" color="text.secondary">Bearish candle</Typography></Stack>
              </Stack>
              <CandlestickChart candles={candles.candles} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
              {candles.candles.length} candles · {candles.unit} interval: {candles.interval} · Updated {formatTime(candles.fetchedAt)} (IST)
            </Typography>
          </>}
        </DialogContent>
      </>}
    </Dialog>
  </Box>;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <Card variant="outlined" sx={{ flex: "1 1 145px", minWidth: 130, p: 1.5, backgroundImage: "none" }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.25 }}>{value}</Typography>
  </Card>;
}

function CandlestickChart({ candles }: { candles: MarketCandle[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const visible = candles.slice(-90);
  const width = 1000;
  const height = 430;
  const left = 76;
  const right = 24;
  const top = 24;
  const priceBottom = 300;
  const volumeTop = 328;
  const volumeBottom = 382;
  const plotWidth = width - left - right;
  const lows = visible.map(c => c.low);
  const highs = visible.map(c => c.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = max - min || Math.max(max * 0.01, 1);
  const paddedMin = min - range * 0.06;
  const paddedMax = max + range * 0.06;
  const y = (value: number) => top + ((paddedMax - value) / (paddedMax - paddedMin)) * (priceBottom - top);
  const maxVolume = Math.max(1, ...visible.map(c => c.volume));
  const slot = plotWidth / visible.length;
  const bodyWidth = Math.max(2, Math.min(11, slot * 0.62));
  const timeLabel = (value: string) => new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  const labelIndexes = [0, Math.floor((visible.length - 1) / 4), Math.floor((visible.length - 1) / 2), Math.floor(3 * (visible.length - 1) / 4), visible.length - 1];

  return <Box sx={{ width: "100%", overflowX: "auto" }}>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Candlestick stock price chart with volume bars" style={{ display: "block", width: "100%", minWidth: 580, height: "auto" }}>
      {Array.from({ length: 5 }, (_, i) => {
        const value = paddedMax - (paddedMax - paddedMin) * i / 4;
        const yy = y(value);
        return <g key={i}>
          <line x1={left} x2={width - right} y1={yy} y2={yy} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="4 5" />
          <text x={left - 10} y={yy + 4} textAnchor="end" fontSize="12" fill="currentColor" opacity="0.75">{value.toFixed(2)}</text>
        </g>;
      })}
      {visible.map((c, i) => {
        const x = left + slot * (i + 0.5);
        const rising = c.close >= c.open;
        const color = rising ? "#26a69a" : "#ef5350";
        const topBody = y(Math.max(c.open, c.close));
        const bodyHeight = Math.max(1.5, Math.abs(y(c.open) - y(c.close)));
        const volumeHeight = (c.volume / maxVolume) * (volumeBottom - volumeTop);
        const hovered = hoveredIndex === i;
        return <g key={c.timestamp} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: "crosshair" }}>
          {hovered && <rect x={left + slot * i} y={top} width={slot} height={volumeBottom - top} fill="currentColor" opacity="0.045" />}
          <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={hovered ? 2.5 : 1.5} />
          <rect x={x - bodyWidth / 2} y={topBody} width={bodyWidth} height={bodyHeight} rx="0.5" fill={color} />
          <rect x={x - Math.max(1, bodyWidth / 2)} y={volumeBottom - volumeHeight} width={Math.max(2, bodyWidth)} height={Math.max(1, volumeHeight)} fill={color} opacity="0.65" />
          <title>{[
            timeLabel(c.timestamp),
            `Open: ${price(c.open)}`,
            `High: ${price(c.high)}`,
            `Low: ${price(c.low)}`,
            `Close: ${price(c.close)}`,
            `Volume: ${formatNumber(c.volume)}`,
          ].join("\\n")}</title>
        </g>;
      })}
      {hoveredIndex !== null && visible[hoveredIndex] && (() => {
        const c = visible[hoveredIndex];
        const x = left + slot * (hoveredIndex + 0.5);
        const boxWidth = 190;
        const boxHeight = 116;
        const bx = Math.min(width - right - boxWidth, Math.max(left, x + 12));
        const by = top + 8;
        return <g pointerEvents="none">
          <line x1={x} x2={x} y1={top} y2={volumeBottom} stroke="currentColor" strokeOpacity="0.35" strokeDasharray="3 3" />
          <rect x={bx} y={by} width={boxWidth} height={boxHeight} rx="6" fill="#171d29" stroke="#64748b" strokeOpacity="0.8" />
          <text x={bx + 10} y={by + 17} fontSize="10" fill="#e2e8f0">{timeLabel(c.timestamp)}</text>
          <text x={bx + 10} y={by + 36} fontSize="11" fill="#e2e8f0">Open  {price(c.open)}</text>
          <text x={bx + 10} y={by + 53} fontSize="11" fill="#e2e8f0">High   {price(c.high)}</text>
          <text x={bx + 10} y={by + 70} fontSize="11" fill="#e2e8f0">Low     {price(c.low)}</text>
          <text x={bx + 10} y={by + 87} fontSize="11" fill="#e2e8f0">Close {price(c.close)}</text>
          <text x={bx + 10} y={by + 104} fontSize="11" fill="#e2e8f0">Volume {formatNumber(c.volume)}</text>
        </g>;
      })()}
      <line x1={left} x2={width - right} y1={priceBottom + 10} y2={priceBottom + 10} stroke="currentColor" strokeOpacity="0.2" />
      <text x={left} y={volumeTop - 7} fontSize="12" fill="currentColor" opacity="0.75">VOLUME</text>
      {labelIndexes.map((idx, i) => visible[idx] ? <text key={i} x={left + slot * (idx + 0.5)} y={height - 18} textAnchor={i === 0 ? "start" : i === labelIndexes.length - 1 ? "end" : "middle"} fontSize="11" fill="currentColor" opacity="0.75">{timeLabel(visible[idx].timestamp)}</text> : null)}
    </svg>
  </Box>;
}

function MoverRow({ stock, onSelect, positive }: { stock: MarketMover; onSelect: (stock: MarketMover) => void; positive: boolean }) {
  return <Button fullWidth onClick={() => onSelect(stock)} sx={{ justifyContent: "flex-start", textAlign: "left", px: 1, py: 1.25, color: "text.primary", borderRadius: 1 }}>
    <Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={700} noWrap>{stock.tradingSymbol}</Typography><Typography variant="caption" color="text.secondary" noWrap>{stock.name}</Typography></Box>
    <Box sx={{ textAlign: "right", ml: 1 }}><Typography variant="body2" fontWeight={700}>{price(stock.lastPrice)}</Typography><Typography variant="caption" sx={{ color: positive ? "success.main" : "error.main", fontWeight: 700 }}>{stock.changePercent > 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%</Typography></Box>
  </Button>;
}
