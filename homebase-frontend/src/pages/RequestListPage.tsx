import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRequests, updateRequest } from '../api/requests';
import type { Request, RequestStatus } from '../types';
import RequestRow from '../components/RequestRow';
import Navbar from '../components/Navbar';

const RequestListPage = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);

  // Filters
  const [keyword, setKeyword]   = useState('');
  const [status, setStatus]     = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');

  // Pagination
  const [page, setPage]         = useState(0);
  const size = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await getRequests({
        keyword:  keyword  || undefined,
        status:   status   || undefined,
        priority: priority || undefined,
        category: category || undefined,
        page, size,
        sortBy: 'createdAt', sortDir: 'desc',
      });
      setRequests(res.content);
      setTotal(res.totalElements);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status, priority, category]);

  // Search on Enter key
  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { setPage(0); load(); }
  };

  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    await updateRequest(id, { status: newStatus });
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
    );
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
            <p className="text-sm text-gray-500 mt-1">{total} total requests</p>
          </div>
          <Link
            to="/requests/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Request
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search requests..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={handleSearch}
            className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <select value={priority} onChange={e => { setPriority(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Categories</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="FACILITIES">Facilities</option>
            <option value="SUPPLY">Supply</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Title', 'Category', 'Priority', 'Status', 'Created By', 'Date', 'Update'].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    No requests found.
                  </td>
                </tr>
              ) : (
                requests.map(r => (
                  <RequestRow key={r.id} request={r} onStatusChange={handleStatusChange} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default RequestListPage;