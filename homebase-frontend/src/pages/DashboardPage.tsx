import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSummary, getRequests } from '../api/requests';
import type { DashboardSummary, Request } from '../types';
import SummaryCard from '../components/SummaryCard';
import PriorityBadge from '../components/PriorityBadge';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary]   = useState<DashboardSummary | null>(null);
  const [recent, setRecent]     = useState<Request[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p] = await Promise.all([
          getSummary(),
          getRequests({ size: 5, sortBy: 'createdAt', sortDir: 'desc' }),
        ]);
        setSummary(s);
        setRecent(p.content);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.fullName.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here's what's happening at the store today.
            </p>
          </div>
          <Link
            to="/requests/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Request
          </Link>
        </div>

        {/* Summary cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard label="Open"        count={summary.open}       color="blue"   />
            <SummaryCard label="In Progress" count={summary.inProgress} color="yellow" />
            <SummaryCard label="Resolved"    count={summary.resolved}   color="green"  />
            <SummaryCard label="Total"       count={summary.total}      color="gray"   />
          </div>
        )}

        {/* Recent requests */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Requests</h2>
            <Link to="/requests" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No requests yet.{' '}
              <Link to="/requests/new" className="text-blue-600 hover:underline">
                Create the first one →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recent.map(r => (
                <li key={r.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.category} · {r.createdByName}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <PriorityBadge priority={r.priority} />
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;