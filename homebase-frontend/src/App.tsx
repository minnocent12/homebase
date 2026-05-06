import { useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import SessionWarningBanner   from './components/SessionWarningBanner';
import LoginPage         from './pages/LoginPage';
import DashboardPage     from './pages/DashboardPage';
import RequestListPage   from './pages/RequestListPage';
import CreateRequestPage from './pages/CreateRequestPage';
import RequestDetailPage from './pages/RequestDetailPage';
import AnalyticsPage     from './pages/AnalyticsPage';

// ── Auth + inactivity guard for all protected routes ──────────
const RequireAuth = () => {
  const { isAuthenticated, logout, refreshSession } = useAuth();
  const navigate = useNavigate();

  const handleTimeout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const { showWarning, secondsLeft, resetTimer } = useInactivityTimer(handleTimeout);

  const handleStayLoggedIn = async () => {
    const ok = await refreshSession();
    if (ok) resetTimer();
    else navigate('/login');
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <>
      <Outlet />
      {showWarning && (
        <SessionWarningBanner
          secondsLeft={secondsLeft}
          onStayLoggedIn={handleStayLoggedIn}
          onLogout={handleTimeout}
        />
      )}
    </>
  );
};

// ── App ───────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — all share one inactivity timer */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/requests"     element={<RequestListPage />} />
          <Route path="/requests/new" element={<CreateRequestPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />
          <Route path="/analytics"    element={<AnalyticsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
