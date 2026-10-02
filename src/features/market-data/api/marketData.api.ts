import apiClient from "../../../api/axios";
import type { MarketCandlesResponse } from "../types/marketData.types";

export interface HistoricalCandlesRequest {
  instrumentKey: string;
  unit: string;
  interval: number;
  fromDate: string;
  toDate: string;
}

export interface IntradayCandlesRequest {
  instrumentKey: string;
  unit: string;
  interval: number;
}

export async function getHistoricalCandles(
  request: HistoricalCandlesRequest,
): Promise<MarketCandlesResponse> {
  const response = await apiClient.get<MarketCandlesResponse>(
    "/market-data/candles",
    { params: request },
  );

  return response.data;
}

export async function getIntradayCandles(
  request: IntradayCandlesRequest,
): Promise<MarketCandlesResponse> {
  const response = await apiClient.get<MarketCandlesResponse>(
    "/market-data/intraday",
    { params: request },
  );

  return response.data;
}
