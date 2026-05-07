import api from './axios';
import type { Team } from '../types';

export const getTeams = async (): Promise<Team[]> => {
  const res = await api.get<Team[]>('/api/teams');
  return res.data;
};

export const assignUserToTeam = async (userId: string, teamId: string | null): Promise<void> => {
  await api.patch(`/api/users/${userId}/team`, { teamId });
};
