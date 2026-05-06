import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ───────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ──────────────────────────────────────
// On 401: try once to refresh the access token, retry the request.
// If refresh also fails, clear storage and send to login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedRefreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', {
            refreshToken: storedRefreshToken,
          });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('user', JSON.stringify(data));
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh failed — fall through to clear + redirect
        }
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
