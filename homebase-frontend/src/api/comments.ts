import api from './axios';
import type { Comment } from '../types';

// GET /api/requests/:requestId/comments
export const getComments = async (requestId: string): Promise<Comment[]> => {
  const res = await api.get<Comment[]>(`/api/requests/${requestId}/comments`);
  return res.data;
};

// POST /api/requests/:requestId/comments
export const addComment = async (requestId: string, body: string): Promise<Comment> => {
  const res = await api.post<Comment>(`/api/requests/${requestId}/comments`, { body });
  return res.data;
};