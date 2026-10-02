export interface MarketCandle {
  timestamp: string; open: number; high: number; low: number; close: number;
  volume: number; openInterest: number | null;
}
export interface MarketCandlesResponse {
  provider: string; instrumentKey: string; unit: string; interval: number;
  fromDate: string | null; toDate: string | null; fetchedAt: string; candles: MarketCandle[];
}
export interface MarketInstrument {
  name: string; tradingSymbol: string; instrumentKey: string; exchange: string; segment: string;
}
export interface MarketMover {
  name: string; tradingSymbol: string; instrumentKey: string; lastPrice: number;
  previousClose: number; netChange: number; changePercent: number; volume: number;
}
export interface MarketDiscoveryResponse {
  fetchedAt: string; featuredStocks: MarketMover[]; topGainers: MarketMover[]; topLosers: MarketMover[];
}

export interface TechnicalAnalysisResponse {
  instrumentKey: string; candleCount: number; calculatedAt: string;
  sma20: number | null; sma50: number | null; ema20: number | null;
  rsi14: number | null; macd: number | null; macdSignal: number | null;
  atr14: number | null; atrPercent: number | null; averageVolume20: number | null;
  trend: string; momentum: string; volatility: string;
}
