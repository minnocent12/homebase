import api from './axios';
import type {
  Request,
  CreateRequestPayload,
  UpdateRequestPayload,
  Page,
  DashboardSummary,
} from '../types';

// POST /api/requests
export const createRequest = async (data: CreateRequestPayload): Promise<Request> => {
  const res = await api.post<Request>('/api/requests', data);
  return res.data;
};

// GET /api/requests
export const getRequests = async (params?: {
  status?: string;
  priority?: string;
  category?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}): Promise<Page<Request>> => {
  const res = await api.get<Page<Request>>('/api/requests', { params });
  return res.data;
};

// GET /api/requests/:id
export const getRequestById = async (id: string): Promise<Request> => {
  const res = await api.get<Request>(`/api/requests/${id}`);
  return res.data;
};

// PUT /api/requests/:id
export const updateRequest = async (
  id: string,
  data: UpdateRequestPayload
): Promise<Request> => {
  const res = await api.put<Request>(`/api/requests/${id}`, data);
  return res.data;
};

// GET /api/requests/summary
export const getSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get<DashboardSummary>('/api/requests/summary');
  return res.data;
};