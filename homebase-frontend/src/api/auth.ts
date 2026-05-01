import api from './axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

// POST /api/auth/login
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/auth/login', data);
  return res.data;
};

// POST /api/auth/register
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/auth/register', data);
  return res.data;
};