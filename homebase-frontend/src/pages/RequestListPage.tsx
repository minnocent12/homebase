import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getRequests, updateRequest } from '../api/requests';
import { getUsers } from '../api/users';
import type { Request, RequestStatus, UserSummary } from '../types';
import RequestRow from '../components/RequestRow';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

type TechTab = 'queue' | 'mywork' | 'submitted';

const RequestListPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const canUpdate    = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers]       = useState<UserSummary[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);

  // Filters
  const [keyword, setKeyword]               = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [status, setStatus]                 = useState(searchParams.get('status') ?? '');
  const [priority, setPriority]             = useState('');
  const [category, setCategory]             = useState('');
  const [dateFrom, setDateFrom]             = useState('');
  const [dateTo, setDateTo]                 = useState('');
  const [assignedToId, setAssignedToId]     = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const size = 10;

  // Technician tab state
  const [activeTab, setActiveTab] = useState<TechTab>('queue');

  // MANAGER/ADMIN fetch full user list for assignment dropdowns.
  useEffect(() => {
    if (canUpdate && !isTechnician) getUsers().then(setUsers).catch(() => {});
  }, [canUpdate, isTechnician]);

  // Debounce keyword — waits 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Reload whenever any filter or page changes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getRequests({
          keyword:      debouncedKeyword || undefined,
          status:       status           || undefined,
          priority:     priority         || undefined,
          category:     category         || undefined,
          assignedToId: assignedToId     || undefined,
          dateFrom:     dateFrom         || undefined,
          dateTo:       dateTo           || undefined,
          page, size,
          sortBy: 'createdAt', sortDir: 'desc',
        });
        setRequests(res.content);
        setTotal(res.totalElements);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, status, priority, category, assignedToId, dateFrom, dateTo, debouncedKeyword]);

  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    await updateRequest(id, { status: newStatus });
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
    );
  };

  const handleAssign = async (id: string, userId: string | null) => {
    await updateRequest(id, { assignedToId: userId ?? undefined });
    const assignedUser = users.find(u => u.id === userId) ?? null;
    // Technicians don't load the users list — use auth context directly for self-assign
    const assignedName = assignedUser?.fullName ?? (userId === user?.userId ? user?.fullName : null);
    setRequests(prev =>
      prev.map(r => r.id === id
        ? { ...r, assignedToId: userId, assignedToName: assignedName ?? null }
        : r
      )
    );
  };

  const handleTabChange = (tab: TechTab) => {
    setActiveTab(tab);
    setKeyword('');
    setDebouncedKeyword('');
    setStatus('');
    setPriority('');
    setDateFrom('');
    setDateTo('');
    setAssignedToId('');
    setPage(0);
  };

  // ── Technician tab filtering (client-side) ────────────────────
  const myId     = user?.userId;
  const myTeamId = user?.teamId;

  const techTabRequests: Record<TechTab, Request[]> = {
    queue:     requests.filter(r => r.teamId === myTeamId && r.assignedToId !== myId && r.createdById !== myId),
    mywork:    requests.filter(r => r.assignedToId === myId),
    submitted: requests.filter(r => r.createdById === myId),
  };

  const tabCounts = {
    queue:     techTabRequests.queue.length,
    mywork:    techTabRequests.mywork.length,
    submitted: techTabRequests.submitted.length,
  };

  const visibleRequests = isTechnician ? techTabRequests[activeTab] : requests;

  const totalPages = Math.ceil(total / size);
  const colCount = 8;

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

        {/* Technician tab bar */}
        {isTechnician && (
          <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-4">
            {([
              { key: 'queue' as TechTab,     label: 'Team Queue',    desc: 'Unassigned requests from your team' },
              { key: 'mywork' as TechTab,    label: 'My Work',       desc: 'Assigned to you' },
              { key: 'submitted' as TechTab, label: 'My Submissions', desc: 'Requests you created' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tabCounts[key]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search requests..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
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
          {!isTechnician && (
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="FACILITIES">Facilities</option>
              <option value="SUPPLY">Supply</option>
              <option value="OTHER">Other</option>
            </select>
          )}
          {canUpdate && (
            <select
              value={assignedToId}
              onChange={e => { setAssignedToId(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assignees</option>
              <option value="__unassigned__">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={e => { setDateTo(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Title', 'Category', 'Priority', 'Status', 'Created By', 'Assigned To', 'Date', 'Update'].map(h => (
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
                    {[...Array(colCount)].map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visibleRequests.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="py-12 text-center text-gray-400 text-sm">
                    {isTechnician
                      ? activeTab === 'queue'     ? 'No unassigned requests in your team.'
                      : activeTab === 'mywork'    ? 'No requests assigned to you.'
                      : 'You haven\'t submitted any requests yet.'
                      : 'No requests found.'}
                  </td>
                </tr>
              ) : (
                visibleRequests.map(r => (
                  <RequestRow
                    key={r.id}
                    request={r}
                    users={users}
                    onStatusChange={handleStatusChange}
                    onAssign={handleAssign}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — only for non-technician views (server-driven) */}
        {!isTechnician && totalPages > 1 && (
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
