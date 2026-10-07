import apiClient from "../../api/axios";

export interface NewsArticle {
  id: string;
  sourceName: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  category: string;
  sentiment: "Positive" | "Negative" | "Neutral" | string;
  sentimentScore: number;
  impact: "High" | "Medium" | "Low" | string;
  relevanceScore: number;
  tickers: string[];
}
export interface NewsListResponse { items: NewsArticle[]; page: number; pageSize: number; totalCount: number; fetchedAt: string; }
export interface NewsAnalysis { ticker: string; articleCount: number; score: number; sentiment: string; impact: string; keyHeadlines: string[]; }
export interface NewsFilters { search?: string; ticker?: string; category?: string; sentiment?: string; sort?: "latest" | "oldest"; page?: number; pageSize?: number; }
export async function getNews(filters: NewsFilters = {}): Promise<NewsListResponse> {
  const response = await apiClient.get<NewsListResponse>("/news", { params: filters });
  return response.data;
}
export async function refreshNews(): Promise<void> { await apiClient.post("/news/refresh"); }
export async function getNewsAnalysis(ticker: string): Promise<NewsAnalysis> {
  const response = await apiClient.get<NewsAnalysis>("/news/analysis/" + encodeURIComponent(ticker));
  return response.data;
}
