import axios from 'axios';
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse } from '../types';

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshSession = async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      logout();
      return false;
    }
    try {
      const { data } = await axios.post<AuthResponse>('/api/auth/refresh', {
        refreshToken: storedRefreshToken,
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return true;
    } catch {
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
