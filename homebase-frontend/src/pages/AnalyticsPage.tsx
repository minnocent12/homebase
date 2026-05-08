import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
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

type TrendPeriod = '7d' | '30d' | '12m';

const TREND_PERIODS: { key: TrendPeriod; label: string }[] = [
  { key: '7d',  label: '7D'  },
  { key: '30d', label: '30D' },
  { key: '12m', label: '12M' },
];

const trendTitle: Record<TrendPeriod, string> = {
  '7d':  'Requests — Last 7 Days',
  '30d': 'Requests — Last 30 Days',
  '12m': 'Requests — Last 12 Months',
};

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [data, setData]             = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading]       = useState(true);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('7d');
  const [trendLoading, setTrendLoading] = useState(false);

  // Redirect ASSOCIATEs
  if (user?.role === 'ASSOCIATE') return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    getAnalyticsSummary('7d')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleTrendPeriod = async (p: TrendPeriod) => {
    setTrendPeriod(p);
    setTrendLoading(true);
    try {
      const updated = await getAnalyticsSummary(p);
      setData(prev => prev ? { ...prev, trendData: updated.trendData } : prev);
    } finally {
      setTrendLoading(false);
    }
  };

  const resolvedCount = data?.byStatus.find(s => s.name === 'RESOLVED')?.value ?? 0;

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
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500">Total Requests</p>
              <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-4xl font-bold text-gray-900">{data.totalRequests}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-green-700">Resolved</p>
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold text-green-800">{resolvedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500">Avg Resolution Time</p>
              <ClockIcon className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-blue-600">
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
                >
                  {data.byStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#9CA3AF'} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value, entry: any) =>
                    `${String(value).replace('_', ' ')}: ${entry.payload.value}`
                  }
                />
                <Tooltip formatter={(value, name) => [value, String(name).replace('_', ' ')]} />
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

          {/* Trend */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">{trendTitle[trendPeriod]}</h2>
              <div className="flex gap-1">
                {TREND_PERIODS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleTrendPeriod(key)}
                    disabled={trendLoading}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                      trendPeriod === key
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.trendData} margin={{ top: 0, right: 10, left: -20, bottom: trendPeriod === '12m' ? 10 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="name"
                  tick={trendPeriod === '12m'
                    ? { fontSize: 10, angle: -35, textAnchor: 'end' }
                    : { fontSize: 11 }}
                  height={trendPeriod === '12m' ? 50 : 30}
                  interval={trendPeriod === '30d' ? 4 : 0}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ r: trendPeriod === '30d' ? 2 : 4, fill: '#6366F1' }}
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