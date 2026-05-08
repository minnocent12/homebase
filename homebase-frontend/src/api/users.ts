import api from './axios';
import type { UserSummary, UserProfile, CreateUserPayload, UpdateUserPayload } from '../types';

export const getUsers = async (): Promise<UserSummary[]> => {
  const res = await api.get<UserSummary[]>('/api/users');
  return res.data;
};

export const getUserProfile = async (id: string, period = '7d'): Promise<UserProfile> => {
  const res = await api.get<UserProfile>(`/api/users/${id}`, { params: { period } });
  return res.data;
};

export const createUser = async (data: CreateUserPayload): Promise<UserSummary> => {
  const res = await api.post<UserSummary>('/api/users', data);
  return res.data;
};

export const updateUser = async (id: string, data: UpdateUserPayload): Promise<UserSummary> => {
  const res = await api.put<UserSummary>(`/api/users/${id}`, data);
  return res.data;
};

export const toggleUserActive = async (id: string, active: boolean): Promise<UserSummary> => {
  const res = await api.patch<UserSummary>(`/api/users/${id}/active`, { active });
  return res.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/api/users/${id}`);
};

export const assignUserToTeam = async (userId: string, teamId: string | null): Promise<void> => {
  await api.patch(`/api/users/${userId}/team`, { teamId });
};
