import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, IconButton, InputAdornment, MenuItem, Pagination, Stack, TextField, Typography } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import NewspaperOutlined from "@mui/icons-material/NewspaperOutlined";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import { getNews, refreshNews, type NewsArticle } from "../../features/news/news.api";

const categories = ["All", "Market", "Economy", "Earnings", "Corporate", "Global"];
const sentiments = ["All", "Positive", "Neutral", "Negative"];

function age(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [search, setSearch] = useState("");
  const [ticker, setTicker] = useState("");
  const [category, setCategory] = useState("All");
  const [sentiment, setSentiment] = useState("All");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async (targetPage = page) => {
    setLoading(true);
    try {
      const result = await getNews({ search: search || undefined, ticker: ticker.trim().toUpperCase() || undefined, category, sentiment, sort, page: targetPage, pageSize: 20 });
      setItems(result.items); setTotal(result.totalCount); setPage(targetPage); setError("");
    } catch { setError("Unable to load news. Refresh the feed and try again."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(1); }, [category, sentiment, sort]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(1), 350);
    return () => window.clearTimeout(timer);
  }, [search, ticker]);

  const refresh = async () => {
    setRefreshing(true);
    try { await refreshNews(); await load(1); }
    catch { setError("News refresh failed. The provider may be temporarily unavailable."); }
    finally { setRefreshing(false); }
  };

  return <Box sx={{ maxWidth: 1200, mx: "auto" }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
      <Box><Stack direction="row" spacing={1} alignItems="center"><NewspaperOutlined color="primary" /><Typography variant="h4" fontWeight={800}>Market News</Typography></Stack><Typography color="text.secondary" sx={{ mt: .5 }}>Latest market and company news with Quantora sentiment signals.</Typography></Box>
      <Button variant="contained" startIcon={refreshing ? <CircularProgress size={18} color="inherit" /> : <RefreshOutlined />} disabled={refreshing} onClick={() => void refresh()}>{refreshing ? "Refreshing…" : "Refresh news"}</Button>
    </Stack>
    <Alert severity="info" sx={{ mb: 2 }}>News is an informational input. Quantora combines it with technical and risk analysis rather than allowing one article to independently trigger a trade.</Alert>
    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
    <Card variant="outlined" sx={{ mb: 2 }}><CardContent><Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
      <TextField fullWidth size="small" placeholder="Search headline, source or stock…" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} />
      <TextField size="small" label="Stock" placeholder="INFY" value={ticker} onChange={e => setTicker(e.target.value)} sx={{ minWidth: { md: 140 } }} />
      <TextField select size="small" label="Category" value={category} onChange={e => setCategory(e.target.value)} sx={{ minWidth: { md: 140 } }}>{categories.map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField>
      <TextField select size="small" label="Sentiment" value={sentiment} onChange={e => setSentiment(e.target.value)} sx={{ minWidth: { md: 140 } }}>{sentiments.map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField>
      <TextField select size="small" label="Order" value={sort} onChange={e => setSort(e.target.value as "latest" | "oldest")} sx={{ minWidth: { md: 140 } }}><MenuItem value="latest">Latest first</MenuItem><MenuItem value="oldest">Oldest first</MenuItem></TextField>
    </Stack></CardContent></Card>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><FilterAltOutlined fontSize="small" color="action" /><Typography variant="body2" color="text.secondary">{total.toLocaleString("en-IN")} articles</Typography></Stack>
    <Card variant="outlined">{loading ? <Box sx={{ p: 6, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }} color="text.secondary">Loading market news…</Typography></Box> : items.length === 0 ? <Box sx={{ p: 6, textAlign: "center" }}><NewspaperOutlined sx={{ fontSize: 44, color: "text.secondary" }} /><Typography fontWeight={700} sx={{ mt: 1 }}>No news found</Typography><Typography color="text.secondary">Try another filter or refresh the feed.</Typography></Box> : <Stack divider={<Divider />}>{items.map(article => <NewsRow key={article.id} article={article} />)}</Stack>}</Card>
    {total > 20 && <Stack alignItems="center" sx={{ py: 3 }}><Pagination count={Math.ceil(total / 20)} page={page} onChange={(_, value) => void load(value)} color="primary" /></Stack>}
  </Box>;
}

function NewsRow({ article }: { article: NewsArticle }) {
  const sentimentColor = article.sentiment === "Positive" ? "success" : article.sentiment === "Negative" ? "error" : "default";
  return <Box sx={{ p: { xs: 2, md: 2.5 }, "&:hover": { bgcolor: "action.hover" } }}>
    <Stack direction="row" justifyContent="space-between" spacing={2}><Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="caption" color="text.secondary">{article.sourceName} · {age(article.publishedAt)}</Typography>
      <Typography component="a" href={article.url} target="_blank" rel="noreferrer" variant="h6" fontWeight={750} sx={{ display: "block", color: "text.primary", textDecoration: "none", mt: .4, "&:hover": { color: "primary.main" } }}>{article.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: .7, display: { xs: "none", sm: "block" } }}>{article.summary}</Typography>
      <Stack direction="row" spacing={.75} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
        <Chip size="small" label={article.category} variant="outlined" />
        <Chip size="small" label={article.sentiment} color={sentimentColor} variant={article.sentiment === "Neutral" ? "outlined" : "filled"} />
        {article.impact !== "Low" && <Chip size="small" label={article.impact + " impact"} color="warning" variant="outlined" />}
        {article.tickers.slice(0, 4).map(t => <Chip key={t} size="small" label={t} variant="outlined" />)}
      </Stack>
    </Box><IconButton component="a" href={article.url} target="_blank" rel="noreferrer" aria-label="Open article" sx={{ alignSelf: "flex-start" }}><OpenInNewOutlined /></IconButton></Stack>
  </Box>;
}
