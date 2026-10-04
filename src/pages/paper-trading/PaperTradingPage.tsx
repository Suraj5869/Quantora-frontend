import { useEffect, useState } from "react";
import {
  Alert, Autocomplete, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import AccountBalanceWalletOutlined from "@mui/icons-material/AccountBalanceWalletOutlined";
import RestartAltOutlined from "@mui/icons-material/RestartAltOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import apiClient from "../../api/axios";
import { getPaperAccount, monitorPaperStops, placePaperOrder, resetPaperAccount, searchPaperInstruments, simulatePaperStop, runPaperAutomation, type PaperAccount, type PaperAutomationRunResult } from "../../features/paper-trading/paperTrading.api";
import type { MarketInstrument } from "../../features/market-data/types/marketData.types";

const money = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
const dateTime = (v: string) => new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
type RiskPreview = { portfolioEquity: number; availableCash: number; riskPercent: number; riskBudget: number; referenceEntryPrice: number; atr14: number; stopPrice: number; stopDistance: number; suggestedQuantity: number; estimatedCost: number; plannedRiskAtStop: number; existingUnrealizedLossEstimate: number; disclaimer: string };

export default function PaperTradingPage() {
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [instrument, setInstrument] = useState<MarketInstrument | null>(null);
  const [options, setOptions] = useState<MarketInstrument[]>([]);
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("1");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [riskPreview, setRiskPreview] = useState<RiskPreview | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState("");
  const [simulationMessage, setSimulationMessage] = useState("");
  const [simulationBusy, setSimulationBusy] = useState<string | null>(null);\n  const [automationBusy, setAutomationBusy] = useState(false);\n  const [automationResult, setAutomationResult] = useState<PaperAutomationRunResult | null>(null);

  const refresh = async () => { setLoading(true); try { setAccount(await getPaperAccount()); setError(""); } catch { setError("Unable to load paper account. Check the backend and database migration."); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); }, []);
  useEffect(() => {
    let active = true;
    let checking = false;
    const checkStops = async () => {
      if (checking) return;
      checking = true;
      try {
        const result = await monitorPaperStops();
        if (!active || result.triggeredCount === 0) return;
        const symbols = result.closedOrders.map(order => order.tradingSymbol).join(", ");
        setMessage(`Protective stop-loss triggered for ${symbols}. Positions were closed in paper trading only.`);
        setAccount(await getPaperAccount());
      } catch {
        // Monitoring is best-effort while this page is open; do not imply a stop was checked successfully.
      } finally {
        checking = false;
      }
    };
    void checkStops();
    const timer = window.setInterval(() => { void checkStops(); }, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      if (query.trim().length < 2) { setOptions([]); return; }
      try { const found = await searchPaperInstruments(query.trim()); if (active) setOptions(found); }
      catch { if (active) setOptions([]); }
    }, 300);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query]);

  const testStop = async (instrumentKey: string, simulatedPrice: number) => {
    setSimulationBusy(`${instrumentKey}:${simulatedPrice}`);
    setSimulationMessage("");
    try {
      const result = await simulatePaperStop(instrumentKey, simulatedPrice);
      setSimulationMessage(`${result.tradingSymbol} at ${money(result.simulatedPrice)}: ${result.message}`);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.response?.data?.title ?? "Unable to simulate stop-loss logic.");
    } finally {
      setSimulationBusy(null);
    }
  };

  const previewRisk = async () => {
    if (!instrument) { setRiskError("Search and select a stock first."); return; }
    setRiskLoading(true); setRiskError(""); setRiskPreview(null);
    try {
      const response = await apiClient.get<RiskPreview>("/paper-trading/risk/preview", { params: { instrumentKey: instrument.instrumentKey, riskPercent: 1 } });
      setRiskPreview(response.data);
      setQuantity(String(response.data.suggestedQuantity));
      setStopLossPrice(String(response.data.stopPrice));
    } catch (e: any) { setRiskError(e?.response?.data?.message ?? e?.response?.data?.title ?? "Unable to calculate risk preview. Confirm market data is available."); }
    finally { setRiskLoading(false); }
  };

  const runAutomation = async () => {\n    setAutomationBusy(true); setError(""); setMessage(""); setAutomationResult(null);\n    try {\n      const result = await runPaperAutomation();\n      setAutomationResult(result);\n      setMessage(`Automatic paper scan completed: ${result.ordersFilled} new paper position(s) opened across ${result.instrumentsReviewed} reviewed instruments.`);\n      await refresh();\n    } catch (e: any) {\n      setError(e?.response?.data?.message ?? e?.response?.data?.title ?? "Automatic paper scan failed. Confirm Upstox market data is available.");\n    } finally { setAutomationBusy(false); }\n  };\n\n  const submitOrder = async () => {
    if (!instrument) { setError("Search and select a stock first."); return; }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) { setError("Enter a valid quantity greater than zero."); return; }
    setPlacing(true); setError(""); setMessage("");
    try {
      const order = await placePaperOrder({ instrumentKey: instrument.instrumentKey, tradingSymbol: instrument.tradingSymbol, side, quantity: qty, stopLossPrice: side === "BUY" ? Number(stopLossPrice) : null });
      if (order.status === "REJECTED") setError(order.rejectionReason ?? "Order rejected.");
      else setMessage(`${side} ${qty} ${instrument.tradingSymbol} filled at ${money(order.executionPrice ?? 0)}. No real broker order was sent.`);
      setRiskPreview(null);
      await refresh();
    } catch (e: any) { setError(e?.response?.data?.message ?? e?.response?.data?.title ?? "Order failed. Confirm Upstox market data is available."); }
    finally { setPlacing(false); }
  };
  const reset = async () => {
    setPlacing(true); setError(""); setMessage("");
    try { setAccount(await resetPaperAccount()); setMessage("Paper account reset to ₹1,00,000. Previous paper orders and positions were cleared."); setResetOpen(false); }
    catch { setError("Unable to reset the paper account."); }
    finally { setPlacing(false); }
  };

  if (loading && !account) return <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  return <Box sx={{ maxWidth: 1500, mx: "auto" }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
      <Box><Stack direction="row" spacing={1} alignItems="center"><AccountBalanceWalletOutlined color="primary" /><Typography variant="h4" fontWeight={800}>Paper Trading</Typography></Stack><Typography color="text.secondary" sx={{ mt: .5 }}>Practice with virtual money using available Upstox market prices.</Typography></Box>
      <Button color="warning" variant="outlined" startIcon={<RestartAltOutlined />} onClick={() => setResetOpen(true)}>Reset account</Button>
    </Stack>
    <Alert severity="info" sx={{ mb: 2 }}>Simulation only. Orders are filled immediately at the latest available intraday candle close, not at a guaranteed live execution price. No real orders are sent to Upstox.</Alert>\n    <Card variant="outlined" sx={{ mb: 2 }}><CardContent>\n      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" spacing={2}>\n        <Box sx={{ minWidth: 0 }}><Typography variant="h6" fontWeight={750}>Automatic paper trading</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: .5 }}>Scan the configured featured-stock universe and paper-buy qualifying bullish setups. Uses a 2× ATR stop, a maximum 1% planned risk per trade, and up to 3 new positions per run.</Typography></Box>\n        <Button variant="contained" onClick={() => void runAutomation()} disabled={automationBusy || placing} sx={{ flexShrink: 0 }}>{automationBusy ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Scanning…</> : "Run automatic scan"}</Button>\n      </Stack>\n      <Alert severity="warning" sx={{ mt: 2 }}>Manual run only: this does not run in the background. The current universe is the configured featured-stock list (20 stocks), not the complete Nifty 50. Paper trades only; no real broker orders are sent.</Alert>\n      {automationResult && <Box sx={{ mt: 2 }}>\n        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{automationResult.message}</Typography>\n        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", sm: "repeat(3,minmax(0,1fr))" }, gap: 1.5, mb: 2 }}>\n          <Summary title="Reviewed" value={String(automationResult.instrumentsReviewed)} />\n          <Summary title="Paper buys filled" value={String(automationResult.ordersFilled)} />\n          <Summary title="No setup" value={String(automationResult.noSetupCount)} />\n        </Box>\n        <TableContainer sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow>{["Stock", "Result", "Entry", "Stop loss", "Details"].map(x => <TableCell key={x} sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{automationResult.results.map((item, index) => <TableRow key={`${item.instrumentKey}-${index}`}><TableCell>{item.tradingSymbol}</TableCell><TableCell><Chip size="small" color={item.status === "Paper order filled" ? "success" : item.status === "Unavailable" || item.status === "Rejected" ? "error" : "default"} label={item.status} /></TableCell><TableCell>{item.executionPrice == null ? "—" : money(item.executionPrice)}</TableCell><TableCell>{item.stopLossPrice == null ? "—" : money(item.stopLossPrice)}</TableCell><TableCell sx={{ minWidth: 240 }}>{item.detail}</TableCell></TableRow>)}</TableBody></Table></TableContainer>\n      </Box>}\n    </CardContent></Card>
    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
    {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
    {simulationMessage && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setSimulationMessage("")}>{simulationMessage} This was a dry run; no order was placed and no position was changed.</Alert>}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", lg: "repeat(4,minmax(0,1fr))" }, gap: 1.5, mb: 2 }}>
      <Summary title="Virtual cash" value={money(account?.availableCash ?? 0)} />
      <Summary title="Invested value" value={money(account?.investedValue ?? 0)} />
      <Summary title="Portfolio value" value={money(account?.portfolioValue ?? 0)} />
      <Summary title="Total P&L" value={money(account?.totalPnl ?? 0)} tone={(account?.totalPnl ?? 0) >= 0 ? "success.main" : "error.main"} />
    </Box>
    <Card variant="outlined" sx={{ mb: 2 }}><CardContent>
      <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>Place simulated market order</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(240px,2fr) 130px 120px 150px auto" }, gap: 1.5, alignItems: "start" }}>
        <Autocomplete options={options} value={instrument} inputValue={query} onInputChange={(_, value) => setQuery(value)} onChange={(_, value) => setInstrument(value)}
          getOptionLabel={o => `${o.tradingSymbol} — ${o.name}`} isOptionEqualToValue={(a,b) => a.instrumentKey === b.instrumentKey}
          filterOptions={x => x} renderInput={params => <TextField {...params} label="Search stock" placeholder="e.g. INFY, RELIANCE" helperText={instrument ? instrument.instrumentKey : "Select a result to trade"} />} />
        <TextField select label="Side" value={side} onChange={e => setSide(e.target.value as "BUY" | "SELL")}><MenuItem value="BUY">Buy</MenuItem><MenuItem value="SELL">Sell</MenuItem></TextField>
        <TextField label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} inputProps={{ min: 1, step: 1 }} />
        {side === "BUY" && <TextField label="Stop-loss price (₹)" type="number" value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} inputProps={{ min: 0.01, step: 0.05 }} helperText="Required; maximum planned risk is 1% of equity." />}
        <Button variant="contained" color={side === "BUY" ? "primary" : "error"} onClick={() => void submitOrder()} disabled={placing || !instrument} sx={{ minHeight: 56 }}>{placing ? <CircularProgress size={22} color="inherit" /> : `Place ${side}`}</Button>
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }} alignItems={{ xs: "stretch", sm: "center" }}>
        <Button variant="outlined" startIcon={riskLoading ? <CircularProgress size={18} /> : <ShieldOutlined />} disabled={riskLoading || !instrument} onClick={() => void previewRisk()}>
          {riskLoading ? "Calculating risk…" : "Preview 1% risk sizing"}
        </Button>
        <Typography variant="caption" color="text.secondary">Uses a 2× ATR stop and cash available; preview does not place an order.</Typography>
      </Stack>
      {riskError && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setRiskError("")}>{riskError}</Alert>}
      {riskPreview && <Box sx={{ mt: 2 }}>
        <Alert severity="info" sx={{ mb: 1.5 }}>{riskPreview.disclaimer}</Alert>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", md: "repeat(4,minmax(0,1fr))" }, gap: 1.5 }}>
          <Summary title="Risk budget (1%)" value={money(riskPreview.riskBudget)} />
          <Summary title="Suggested quantity" value={String(riskPreview.suggestedQuantity)} />
          <Summary title="Reference entry" value={money(riskPreview.referenceEntryPrice)} />
          <Summary title="ATR stop price" value={money(riskPreview.stopPrice)} />
          <Summary title="Estimated cost" value={money(riskPreview.estimatedCost)} />
          <Summary title="Planned risk at stop" value={money(riskPreview.plannedRiskAtStop)} tone="warning.main" />
          <Summary title="ATR (14)" value={money(riskPreview.atr14)} />
          <Summary title="Available cash" value={money(riskPreview.availableCash)} />
        </Box>
      </Box>}
    </CardContent></Card>
    <Card variant="outlined" sx={{ mb: 2 }}><CardContent sx={{ pb: "12px !important" }}><Stack direction="row" alignItems="center" spacing={1}><TrendingUpOutlined color="primary" /><Typography variant="h6" fontWeight={750}>Open positions</Typography></Stack></CardContent>
      {(account?.positions.length ?? 0) === 0 ? <Box sx={{ p: 4, textAlign: "center" }}><Typography color="text.secondary">No open positions yet. Place a simulated buy order to get started.</Typography></Box> :
      <TableContainer sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow>{["Stock","Quantity","Average price","Last price","Stop loss","Market value","Unrealized P&L","Test stop logic"].map(x=><TableCell key={x} sx={{ whiteSpace:"nowrap",fontWeight:700 }}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{account!.positions.map(p=><TableRow key={p.instrumentKey}><TableCell><Typography fontWeight={700}>{p.tradingSymbol}</Typography><Typography variant="caption" color="text.secondary">{p.instrumentKey}</Typography></TableCell><TableCell>{p.quantity}</TableCell><TableCell>{money(p.averagePrice)}</TableCell><TableCell>{money(p.lastPrice)}</TableCell><TableCell>{p.stopLossPrice == null ? "—" : money(p.stopLossPrice)}</TableCell><TableCell>{money(p.marketValue)}</TableCell><TableCell><Typography color={p.unrealizedPnl >= 0 ? "success.main" : "error.main"} fontWeight={700}>{money(p.unrealizedPnl)}</Typography></TableCell><TableCell>{p.stopLossPrice == null ? "Set a stop first" : <Stack direction="column" spacing={0.5}><Button size="small" variant="outlined" disabled={simulationBusy !== null} onClick={() => void testStop(p.instrumentKey, p.stopLossPrice!)}>Test trigger</Button><Button size="small" variant="text" disabled={simulationBusy !== null} onClick={() => void testStop(p.instrumentKey, Number((p.stopLossPrice! * 1.01).toFixed(2)))}>Test safe price</Button></Stack>}</TableCell></TableRow>)}</TableBody></Table></TableContainer>}
    </Card>
    <Card variant="outlined"><CardContent sx={{ pb: "12px !important" }}><Typography variant="h6" fontWeight={750}>Order history</Typography></CardContent>
      {(account?.recentOrders.length ?? 0) === 0 ? <Box sx={{ p: 4, textAlign: "center" }}><Typography color="text.secondary">No paper orders recorded.</Typography></Box> :
      <TableContainer sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow>{["Time","Stock","Side","Quantity","Fill price","Order value","Status","Realized P&L"].map(x=><TableCell key={x} sx={{ whiteSpace:"nowrap",fontWeight:700 }}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{account!.recentOrders.map(o=><TableRow key={o.id}><TableCell sx={{ whiteSpace:"nowrap" }}>{dateTime(o.createdAt)}</TableCell><TableCell>{o.tradingSymbol}</TableCell><TableCell><Chip size="small" color={o.side === "BUY" ? "success" : "error"} label={o.side} /></TableCell><TableCell>{o.quantity}</TableCell><TableCell>{o.executionPrice == null ? "—" : money(o.executionPrice)}</TableCell><TableCell>{o.totalValue == null ? "—" : money(o.totalValue)}</TableCell><TableCell><Chip size="small" color={o.status === "FILLED" ? "success" : "error"} label={o.status} /></TableCell><TableCell>{money(o.realizedPnl)}</TableCell></TableRow>)}</TableBody></Table></TableContainer>}
    </Card>
    <Dialog open={resetOpen} onClose={() => setResetOpen(false)}><DialogTitle>Reset paper account?</DialogTitle><DialogContent><Typography>This clears all virtual positions and paper order history and restores your starting cash to ₹1,00,000. This cannot be undone.</Typography></DialogContent><DialogActions><Button onClick={() => setResetOpen(false)}>Cancel</Button><Button color="error" variant="contained" disabled={placing} onClick={() => void reset()}>Reset account</Button></DialogActions></Dialog>
  </Box>;
}
function Summary({ title, value, tone }: { title: string; value: string; tone?: string }) {
  return <Card variant="outlined"><CardContent><Typography variant="body2" color="text.secondary">{title}</Typography><Typography variant="h5" fontWeight={800} color={tone} sx={{ mt: .5 }}>{value}</Typography></CardContent></Card>;
}
