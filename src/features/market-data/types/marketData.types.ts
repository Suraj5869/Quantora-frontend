export interface MarketCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest: number | null;
}

export interface MarketCandlesResponse {
  provider: string;
  instrumentKey: string;
  unit: string;
  interval: number;
  fromDate: string | null;
  toDate: string | null;
  fetchedAt: string;
  candles: MarketCandle[];
}
