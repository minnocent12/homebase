import api from './axios';
import type { UserSummary, CreateUserPayload } from '../types';

export const getUsers = async (): Promise<UserSummary[]> => {
  const res = await api.get<UserSummary[]>('/api/users');
  return res.data;
};

export const createUser = async (data: CreateUserPayload): Promise<UserSummary> => {
  const res = await api.post<UserSummary>('/api/users', data);
  return res.data;
};

export const assignUserToTeam = async (userId: string, teamId: string | null): Promise<void> => {
  await api.patch(`/api/users/${userId}/team`, { teamId });
};
