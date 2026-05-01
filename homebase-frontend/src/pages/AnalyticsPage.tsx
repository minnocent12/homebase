import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { getAnalyticsSummary } from '../api/analytics';
import type { AnalyticsSummary } from '../api/analytics';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  OPEN:        '#3B82F6',
  IN_PROGRESS: '#F59E0B',
  RESOLVED:    '#10B981',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH:     '#F97316',
  MEDIUM:   '#EAB308',
  LOW:      '#22C55E',
};

const CATEGORY_COLOR = '#6366F1';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [data, setData]       = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect ASSOCIATEs
  if (user?.role === 'ASSOCIATE') return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    getAnalyticsSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const resolvedCount = data?.byStatus.find(s => s.name === 'OPEN' === false && s.name === 'RESOLVED')?.value
    ?? data?.byStatus.find(s => s.name === 'RESOLVED')?.value ?? 0;

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Store Support Center — request insights</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Requests</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">{data.totalRequests}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-4xl font-bold text-green-600 mt-1">{resolvedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Avg Resolution Time</p>
            <p className="text-4xl font-bold text-blue-600 mt-1">
              {data.avgResolutionHours > 0 ? `${data.avgResolutionHours}h` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-2 gap-6">

          {/* Requests by Category */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Requests by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.byCategory} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill={CATEGORY_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Requests by Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Requests by Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.byStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${String(name).replace('_', ' ')}: ${value}`}
                  labelLine={false}
                >
                  {data.byStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#9CA3AF'} />
                  ))}
                </Pie>
                <Legend formatter={v => v.replace('_', ' ')} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Requests by Priority */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Requests by Priority</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.byPriority} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.byPriority.map((entry, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[entry.name] ?? '#9CA3AF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 7-day trend */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Requests — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.last7DaysTrend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#6366F1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;