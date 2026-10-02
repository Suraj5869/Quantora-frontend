import apiClient from "../../api/axios";
import type { MarketInstrument } from "../market-data/types/marketData.types";

export interface PaperPosition {
  instrumentKey: string; tradingSymbol: string; quantity: number; averagePrice: number;
  lastPrice: number; stopLossPrice: number | null; marketValue: number; unrealizedPnl: number;
}
export interface PaperOrder {
  id: string; instrumentKey: string; tradingSymbol: string; side: string; quantity: number;
  status: string; executionPrice: number | null; totalValue: number | null; realizedPnl: number;
  rejectionReason: string | null; createdAt: string; executedAt: string | null;
}
export interface PaperAccount {
  id: string; initialCash: number; availableCash: number; investedValue: number;
  portfolioValue: number; totalPnl: number; positions: PaperPosition[]; recentOrders: PaperOrder[];
}
export async function getPaperAccount() {
  return (await apiClient.get<PaperAccount>("/paper-trading/account")).data;
}
export async function placePaperOrder(request: { instrumentKey: string; tradingSymbol: string; side: "BUY" | "SELL"; quantity: number; stopLossPrice?: number | null }) {
  return (await apiClient.post<PaperOrder>("/paper-trading/orders", request)).data;
}
export async function resetPaperAccount() {
  return (await apiClient.post<PaperAccount>("/paper-trading/reset")).data;
}
export async function searchPaperInstruments(query: string) {
  return (await apiClient.get<MarketInstrument[]>("/market-data/search", { params: { query } })).data;
}
