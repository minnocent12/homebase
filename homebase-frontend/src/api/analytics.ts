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
  last7DaysTrend: ChartEntry[];
  avgResolutionHours: number;
}

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await api.get<AnalyticsSummary>('/api/analytics/summary');
  return res.data;
};