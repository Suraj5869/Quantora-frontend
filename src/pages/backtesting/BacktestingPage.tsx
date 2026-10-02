import { useState } from "react";
import { Alert, Autocomplete, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import apiClient from "../../api/axios";
import { searchStocks } from "../../features/market-data/api/marketData.api";
import type { MarketInstrument } from "../../features/market-data/types/marketData.types";

type Trade = { timestamp: string; side: string; quantity: number; price: number; pnl: number; reason: string };
type Result = { instrumentKey: string; fromDate: string; toDate: string; initialCapital: number; finalEquity: number; netPnl: number; returnPercent: number; maxDrawdownPercent: number; tradeCount: number; winRatePercent: number; profitFactor: number | null; strategy: string; assumptions: string[]; trades: Trade[]; equityCurve: { timestamp: string; equity: number }[] };
const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const yearAgo = new Date(Date.now() - 330 * 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
export default function BacktestingPage() {
  const [stock,setStock] = useState<MarketInstrument|null>(null);
  const [query,setQuery] = useState("");
  const [options,setOptions] = useState<MarketInstrument[]>([]);
  const [fromDate,setFromDate] = useState(yearAgo);
  const [toDate,setToDate] = useState(today);
  const [capital,setCapital] = useState("100000");
  const [risk,setRisk] = useState("1");
  const [result,setResult] = useState<Result|null>(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const search = async (value:string) => { setQuery(value); if(value.trim().length<2){setOptions([]);return;} try{setOptions(await searchStocks(value.trim()));}catch{setOptions([]);} };
  const run = async () => {
    if(!stock){setError("Search and select an NSE stock first.");return;}
    if(fromDate>=toDate){setError("Start date must be before end date.");return;}
    setLoading(true);setError("");setResult(null);
    try{const response=await apiClient.post<Result>("/backtesting/run",{instrumentKey:stock.instrumentKey,fromDate,toDate,initialCapital:Number(capital),riskPercent:Number(risk)});setResult(response.data);}
    catch(e:unknown){const err=e as {response?:{data?:{message?:string;title?:string}}};setError(err.response?.data?.message??err.response?.data?.title??"Backtest failed. Check Upstox connectivity and historical data availability.");}
    finally{setLoading(false);}
  };
  return <Box sx={{maxWidth:1500,mx:"auto"}}>
    <Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{xs:"stretch",sm:"center"}} spacing={2} sx={{mb:3}}>
      <Box><Stack direction="row" spacing={1} alignItems="center"><ScienceOutlined color="primary"/><Typography variant="h4" fontWeight={800}>Strategy Backtesting</Typography></Stack><Typography color="text.secondary" sx={{mt:.5}}>Evaluate a deterministic strategy on historical daily candles before enabling automation.</Typography></Box>
    </Stack>
    <Alert severity="warning" sx={{mb:2}}>Research simulation only. This first version tests one selected stock, uses daily candles, and does not place broker orders. Results exclude brokerage, taxes and slippage; historical performance does not predict future returns.</Alert>
    {error&&<Alert severity="error" sx={{mb:2}} onClose={()=>setError("")}>{error}</Alert>}
    <Card variant="outlined" sx={{mb:2}}><CardContent><Typography variant="h6" fontWeight={750} sx={{mb:2}}>Backtest configuration</Typography>
      <Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",md:"minmax(220px,2fr) repeat(4,minmax(130px,1fr)) auto"},gap:1.5,alignItems:"start"}}>
        <Autocomplete options={options} value={stock} inputValue={query} onInputChange={(_,v)=>void search(v)} onChange={(_,v)=>setStock(v)} filterOptions={x=>x} getOptionLabel={x=>`${x.tradingSymbol} — ${x.name}`} isOptionEqualToValue={(a,b)=>a.instrumentKey===b.instrumentKey} renderInput={params=><TextField {...params} label="NSE stock" placeholder="Search e.g. INFY"/>}/>
        <TextField label="From date" type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} InputLabelProps={{shrink:true}}/>
        <TextField label="To date" type="date" value={toDate} onChange={e=>setToDate(e.target.value)} InputLabelProps={{shrink:true}}/>
        <TextField label="Starting capital (₹)" type="number" value={capital} onChange={e=>setCapital(e.target.value)} inputProps={{min:1000}}/>
        <TextField label="Risk per trade (%)" type="number" value={risk} onChange={e=>setRisk(e.target.value)} inputProps={{min:.1,max:1,step:.1}}/>
        <Button variant="contained" onClick={()=>void run()} disabled={loading||!stock} sx={{minHeight:56}}>{loading?<CircularProgress size={22} color="inherit"/>:"Run backtest"}</Button>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{mt:2}}><Chip label="SMA 20/50 crossover"/><Chip label="ATR 14 stop (2× ATR)"/><Chip label="Target 2R"/><Chip label="Long-only"/></Stack>
    </CardContent></Card>
    {result&&<>
      <Typography variant="h6" fontWeight={750} sx={{mb:1}}>Results · {stock?.tradingSymbol}</Typography>
      <Box sx={{display:"grid",gridTemplateColumns:{xs:"repeat(2,minmax(0,1fr))",lg:"repeat(4,minmax(0,1fr))"},gap:1.5,mb:2}}>
        <Metric label="Net P&L" value={money(result.netPnl)} color={result.netPnl>=0?"success.main":"error.main"}/>
        <Metric label="Return" value={`${result.returnPercent.toFixed(2)}%`} color={result.returnPercent>=0?"success.main":"error.main"}/>
        <Metric label="Max drawdown" value={`${result.maxDrawdownPercent.toFixed(2)}%`} color="error.main"/>
        <Metric label="Closed trades" value={String(result.tradeCount)}/>
        <Metric label="Win rate" value={`${result.winRatePercent.toFixed(1)}%`}/>
        <Metric label="Profit factor" value={result.profitFactor==null?"—":result.profitFactor.toFixed(2)}/>
        <Metric label="Starting capital" value={money(result.initialCapital)}/>
        <Metric label="Final equity" value={money(result.finalEquity)}/>
      </Box>
      <Card variant="outlined" sx={{mb:2}}><CardContent><Typography variant="h6" fontWeight={750}>Assumptions and limitations</Typography>{result.assumptions.map(x=><Typography key={x} variant="body2" color="text.secondary" sx={{mt:1}}>• {x}</Typography>)}</CardContent></Card>
      <Card variant="outlined"><CardContent><Typography variant="h6" fontWeight={750}>Trade log</Typography></CardContent>
        <TableContainer sx={{maxHeight:460,overflow:"auto"}}><Table size="small" stickyHeader><TableHead><TableRow>{["Date","Side","Quantity","Price","P&L","Reason"].map(x=><TableCell key={x} sx={{fontWeight:700,whiteSpace:"nowrap"}}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{result.trades.map((t,i)=><TableRow key={i}><TableCell sx={{whiteSpace:"nowrap"}}>{new Date(t.timestamp).toLocaleDateString("en-IN")}</TableCell><TableCell><Chip size="small" label={t.side} color={t.side==="BUY"?"primary":"default"}/></TableCell><TableCell>{t.quantity}</TableCell><TableCell>{money(t.price)}</TableCell><TableCell sx={{color:t.pnl>0?"success.main":t.pnl<0?"error.main":"text.primary"}}>{money(t.pnl)}</TableCell><TableCell>{t.reason}</TableCell></TableRow>)}</TableBody></Table></TableContainer>
      </Card>
    </>}
  </Box>;
}
function Metric({label,value,color}:{label:string;value:string;color?:string}){return <Card variant="outlined"><CardContent><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h5" fontWeight={800} color={color} sx={{mt:.5}}>{value}</Typography></CardContent></Card>}
