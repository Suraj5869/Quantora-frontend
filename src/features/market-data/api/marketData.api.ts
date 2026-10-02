import apiClient from "../../../api/axios";
import type { MarketCandlesResponse, MarketDiscoveryResponse, MarketInstrument, TechnicalAnalysisResponse } from "../types/marketData.types";

export interface HistoricalCandlesRequest { instrumentKey: string; unit: string; interval: number; fromDate: string; toDate: string; }
export interface IntradayCandlesRequest { instrumentKey: string; unit: string; interval: number; }

export async function getHistoricalCandles(request: HistoricalCandlesRequest): Promise<MarketCandlesResponse> {
  const response = await apiClient.get<MarketCandlesResponse>("/market-data/candles", { params: request });
  return response.data;
}
export async function getIntradayCandles(request: IntradayCandlesRequest): Promise<MarketCandlesResponse> {
  const response = await apiClient.get<MarketCandlesResponse>("/market-data/intraday", { params: request });
  return response.data;
}
export async function searchStocks(query: string): Promise<MarketInstrument[]> {
  const response = await apiClient.get<MarketInstrument[]>("/market-data/search", { params: { query } });
  return response.data;
}
export async function getMarketDiscovery(): Promise<MarketDiscoveryResponse> {
  const response = await apiClient.get<MarketDiscoveryResponse>("/market-data/discover");
  return response.data;
}

export async function getTechnicalAnalysis(request: {
  instrumentKey: string; unit: string; interval: number; intraday: boolean;
  fromDate?: string; toDate?: string;
}): Promise<TechnicalAnalysisResponse> {
  const response = await apiClient.get<TechnicalAnalysisResponse>("/market-data/analysis", { params: request });
  return response.data;
}
