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
