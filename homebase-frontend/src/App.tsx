import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage         from './pages/LoginPage';
import DashboardPage     from './pages/DashboardPage';
import RequestListPage   from './pages/RequestListPage';
import CreateRequestPage from './pages/CreateRequestPage';

// ── Protected route wrapper ───────────────────────────────────
const Protected = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ── App ───────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <Protected><DashboardPage /></Protected>
        } />
        <Route path="/requests" element={
          <Protected><RequestListPage /></Protected>
        } />
        <Route path="/requests/new" element={
          <Protected><CreateRequestPage /></Protected>
        } />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;