import api from './axios';

export interface ChartEntry {
  name: string;
  value: number;
}

export interface AnalyticsSummary {
  totalRequests: number;
  byCategory: ChartEntry[];
  byStatus: ChartEntry[];
  byPriority: ChartEntry[];
  trendData: ChartEntry[];
  avgResolutionHours: number;
}

export const getAnalyticsSummary = async (period = '7d'): Promise<AnalyticsSummary> => {
  const res = await api.get<AnalyticsSummary>('/api/analytics/summary', { params: { period } });
  return res.data;
};
