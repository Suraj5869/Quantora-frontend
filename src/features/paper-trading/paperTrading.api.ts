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

export interface StopLossSimulationResult {
  instrumentKey: string;
  tradingSymbol: string;
  stopLossPrice: number | null;
  simulatedPrice: number;
  wouldTrigger: boolean;
  message: string;
}
export async function simulatePaperStop(instrumentKey: string, simulatedPrice: number) {
  return (await apiClient.post<StopLossSimulationResult>("/paper-trading/simulate-stop", { instrumentKey, simulatedPrice })).data;
}
export interface StopMonitorResult {
  checkedAt: string;
  triggeredCount: number;
  closedOrders: PaperOrder[];
}
export async function monitorPaperStops() {
  return (await apiClient.post<StopMonitorResult>("/paper-trading/monitor-stops")).data;
}


export interface PaperAutomationRunItem {
  tradingSymbol: string;
  instrumentKey: string;
  status: string;
  detail: string;
  executionPrice: number | null;
  stopLossPrice: number | null;
}
export interface PaperAutomationRunResult {
  runAt: string;
  instrumentsReviewed: number;
  ordersFilled: number;
  noSetupCount: number;
  results: PaperAutomationRunItem[];
  message: string;
}
export async function runPaperAutomation() {
  return (await apiClient.post<PaperAutomationRunResult>("/paper-trading/automation/run")).data;
}
