import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { getUserProfile, updateUser, toggleUserActive, deleteUser } from '../api/users';
import { getTeams } from '../api/teams';
import type { UserProfile, Team, UpdateUserPayload } from '../types';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

// ── Colour maps ───────────────────────────────────────────────
const roleColors: Record<string, string> = {
  ADMIN:      'bg-red-100 text-red-700',
  MANAGER:    'bg-purple-100 text-purple-700',
  TECHNICIAN: 'bg-teal-100 text-teal-700',
  ASSOCIATE:  'bg-blue-100 text-blue-700',
};

const teamCategoryColors: Record<string, string> = {
  IT:         'bg-blue-50 text-blue-600',
  FACILITIES: 'bg-orange-50 text-orange-600',
  HR:         'bg-purple-50 text-purple-600',
  SUPPLY:     'bg-green-50 text-green-600',
  OTHER:      'bg-gray-50 text-gray-600',
};

const statusColors: Record<string, string> = {
  OPEN:        'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED:    'bg-green-100 text-green-700',
};

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH:     'bg-orange-100 text-orange-700',
  MEDIUM:   'bg-yellow-100 text-yellow-700',
  LOW:      'bg-green-100 text-green-700',
};

// ── Edit Modal ────────────────────────────────────────────────
interface EditModalProps {
  profile: UserProfile;
  teams: Team[];
  onClose: () => void;
  onSaved: (updated: UserProfile) => void;
}

const EditUserModal = ({ profile, teams, onClose, onSaved }: EditModalProps) => {
  const [form, setForm] = useState<UpdateUserPayload>({
    fullName: profile.fullName,
    email:    profile.email,
    role:     profile.role,
    teamId:   profile.teamId ?? '',
  });
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof UpdateUserPayload, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const updated = await updateUser(profile.id, form);
      onSaved({ ...profile, ...updated });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? 'Failed to save changes.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required type="text" value={form.fullName ?? ''}
              onChange={e => set('fullName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" value={form.email ?? ''}
              onChange={e => set('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role ?? ''} onChange={e => set('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ASSOCIATE">Associate</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select value={form.teamId ?? ''} onChange={e => set('teamId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No team assigned</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Shared recent-requests table ──────────────────────────────
const RecentRequestsTable = ({ requests }: { requests: UserProfile['submittedRequests'] }) =>
  requests.length === 0 ? (
    <p className="py-10 text-center text-sm text-gray-400 italic">No requests found.</p>
  ) : (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          {['Title', 'Status', 'Priority', 'Date'].map(h => (
            <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {requests.map(r => (
          <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4">
              <Link to={`/requests/${r.id}`} className="text-sm text-blue-600 hover:underline font-medium">
                {r.title}
              </Link>
            </td>
            <td className="py-3 px-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {r.status.replace('_', ' ')}
              </span>
            </td>
            <td className="py-3 px-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[r.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                {r.priority}
              </span>
            </td>
            <td className="py-3 px-4 text-xs text-gray-500">
              {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

type TrendPeriod = '7d' | '30d' | '12m';

const TREND_PERIODS: { key: TrendPeriod; label: string }[] = [
  { key: '7d',  label: '7D'  },
  { key: '30d', label: '30D' },
  { key: '12m', label: '12M' },
];

const trendTitle: Record<TrendPeriod, string> = {
  '7d':  'Activity — Last 7 Days',
  '30d': 'Activity — Last 30 Days',
  '12m': 'Activity — Last 12 Months',
};

// ── Page ──────────────────────────────────────────────────────
const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin        = currentUser?.role === 'ADMIN';
  const canManageUsers = currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN';

  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [teams, setTeams]         = useState<Team[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showEdit, setShowEdit]   = useState(false);
  const [tab, setTab]             = useState<'submitted' | 'assigned' | 'comments'>('submitted');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError]     = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [trendPeriod, setTrendPeriod]         = useState<TrendPeriod>('7d');
  const [trendLoading, setTrendLoading]       = useState(false);
  const [trendData, setTrendData]             = useState<UserProfile['trendData']>([]);
  const [assignedTrendData, setAssignedTrendData] = useState<UserProfile['assignedTrendData']>([]);

  // Submissions tab filters
  const [subSearch,   setSubSearch]   = useState('');
  const [subStatus,   setSubStatus]   = useState('');
  const [subPriority, setSubPriority] = useState('');
  const [subFrom,     setSubFrom]     = useState('');
  const [subTo,       setSubTo]       = useState('');

  // Assigned Work tab filters
  const [asgSearch,   setAsgSearch]   = useState('');
  const [asgStatus,   setAsgStatus]   = useState('');
  const [asgPriority, setAsgPriority] = useState('');
  const [asgFrom,     setAsgFrom]     = useState('');
  const [asgTo,       setAsgTo]       = useState('');

  // Comments tab filters
  const [comSearch, setComSearch] = useState('');
  const [comFrom,   setComFrom]   = useState('');
  const [comTo,     setComTo]     = useState('');

  useEffect(() => {
    if (!id) return;
    const fetches: Promise<void>[] = [
      getUserProfile(id).then(p => {
        setProfile(p);
        setTrendData(p.trendData);
        setAssignedTrendData(p.assignedTrendData);
      }),
    ];
    if (isAdmin) fetches.push(getTeams().then(setTeams));
    Promise.all(fetches).finally(() => setLoading(false));
  }, [id, isAdmin]);

  const handleTrendPeriod = async (p: TrendPeriod) => {
    if (!id) return;
    setTrendPeriod(p);
    setTrendLoading(true);
    try {
      const updated = await getUserProfile(id, p);
      setTrendData(updated.trendData);
      setAssignedTrendData(updated.assignedTrendData);
    } finally {
      setTrendLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const updated = await toggleUserActive(profile.id, !profile.active);
      setProfile(prev => prev ? { ...prev, active: updated.active } : prev);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    setActionLoading(true);
    setDeleteError('');
    try {
      await deleteUser(profile.id);
      navigate('/users');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setDeleteError(msg ?? 'Could not delete user.');
      setDeleteConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-5xl mx-auto px-6 py-8 text-center text-gray-400 py-20">User not found.</main>
      </div>
    );
  }

  const isAssociate = profile.role === 'ASSOCIATE';
  const isSelf      = currentUser?.userId === profile.id;

  const resolvedRate = profile.requestsCreated > 0
    ? Math.round((profile.resolvedCount / profile.requestsCreated) * 100)
    : 0;

  // Grouped bar chart data: one row per status, two bars (Submitted vs Assigned)
  const activityBreakdown = [
    { status: 'Open',        Submitted: profile.openCount,       Assigned: profile.assignedOpenCount },
    { status: 'In Progress', Submitted: profile.inProgressCount, Assigned: profile.assignedInProgressCount },
    { status: 'Resolved',    Submitted: profile.resolvedCount,   Assigned: profile.assignedResolvedCount },
  ];

  // Merged trend: combine submitted + assigned into one dataset
  const chartTrendData = trendData.map((entry, i) => ({
    name:      entry.name,
    Submitted: entry.value,
    Assigned:  assignedTrendData[i]?.value ?? 0,
  }));

  const filteredSubmissions = (profile.submittedRequests ?? []).filter(r => {
    const d = r.createdAt.slice(0, 10);
    return (
      (!subSearch   || r.title.toLowerCase().includes(subSearch.toLowerCase())) &&
      (!subStatus   || r.status === subStatus) &&
      (!subPriority || r.priority === subPriority) &&
      (!subFrom     || d >= subFrom) &&
      (!subTo       || d <= subTo)
    );
  });
  const filteredAssigned = (profile.assignedRequests ?? []).filter(r => {
    const d = r.createdAt.slice(0, 10);
    return (
      (!asgSearch   || r.title.toLowerCase().includes(asgSearch.toLowerCase())) &&
      (!asgStatus   || r.status === asgStatus) &&
      (!asgPriority || r.priority === asgPriority) &&
      (!asgFrom     || d >= asgFrom) &&
      (!asgTo       || d <= asgTo)
    );
  });
  const filteredComments = (profile.comments ?? []).filter(c => {
    const d = c.createdAt.slice(0, 10);
    return (
      (!comSearch || c.body.toLowerCase().includes(comSearch.toLowerCase()) ||
        c.requestTitle.toLowerCase().includes(comSearch.toLowerCase())) &&
      (!comFrom || d >= comFrom) &&
      (!comTo   || d <= comTo)
    );
  });
  const isSubFiltered = !!(subSearch || subStatus || subPriority || subFrom || subTo);
  const isAsgFiltered = !!(asgSearch || asgStatus || asgPriority || asgFrom || asgTo);
  const isComFiltered = !!(comSearch || comFrom || comTo);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Back link */}
        {canManageUsers ? (
          <Link to="/users" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to Users
          </Link>
        ) : (
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to Dashboard
          </Link>
        )}

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">{profile.fullName}</h1>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[profile.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {profile.role}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {profile.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{profile.email}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {profile.teamName && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${teamCategoryColors[profile.teamCategory ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                      {profile.teamName}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setShowEdit(true)}
                  className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit
                </button>
                {!isSelf && (
                  <>
                    <button onClick={handleToggleActive} disabled={actionLoading}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        profile.active
                          ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                          : 'border border-green-200 text-green-600 hover:bg-green-50'
                      }`}>
                      {profile.active ? 'Disable' : 'Enable'}
                    </button>
                    {!deleteConfirm ? (
                      <button onClick={() => setDeleteConfirm(true)}
                        className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        Delete
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-600 font-medium">Sure?</span>
                        <button onClick={handleDelete} disabled={actionLoading}
                          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors">Yes</button>
                        <button onClick={() => { setDeleteConfirm(false); setDeleteError(''); }}
                          className="px-2 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">No</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {deleteError && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{deleteError}</p>
          )}
        </div>

        {/* Stat cards */}
        <div className={`grid gap-4 ${isAssociate ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
          {[
            { label: 'Requests Submitted', value: profile.requestsCreated,  accent: 'text-blue-600',   show: true           },
            { label: 'Requests Assigned',  value: profile.requestsAssigned, accent: 'text-purple-600', show: !isAssociate   },
            { label: 'Comments Posted',    value: profile.commentsPosted,   accent: 'text-teal-600',   show: true           },
            { label: 'Resolved Rate',      value: `${resolvedRate}%`,       accent: 'text-green-600',  show: true           },
          ].filter(c => c.show).map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className={`text-2xl font-bold ${card.accent}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Activity breakdown — grouped bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Request Activity Breakdown</h3>
            <p className="text-xs text-gray-400 mb-4">Submitted by user vs. assigned to user, by status</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Submitted" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                {!isAssociate && <Bar dataKey="Assigned" fill="#8b5cf6" radius={[3, 3, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Trend — two lines */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900">{trendTitle[trendPeriod]}</h3>
              <div className="flex gap-1">
                {TREND_PERIODS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleTrendPeriod(key)}
                    disabled={trendLoading}
                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
                      trendPeriod === key
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Requests submitted and assigned {trendPeriod === '12m' ? 'per month' : 'per day'}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartTrendData} margin={{ top: 5, right: 10, left: -20, bottom: trendPeriod === '12m' ? 10 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={trendPeriod === '12m'
                    ? { fontSize: 10, angle: -35, textAnchor: 'end' }
                    : { fontSize: 11 }}
                  height={trendPeriod === '12m' ? 50 : 30}
                  interval={trendPeriod === '30d' ? 4 : 0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Submitted" stroke="#3b82f6" strokeWidth={2}
                  dot={{ r: trendPeriod === '30d' ? 1 : 3 }} />
                {!isAssociate && <Line type="monotone" dataKey="Assigned" stroke="#8b5cf6" strokeWidth={2}
                  dot={{ r: trendPeriod === '30d' ? 1 : 3 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {([
              { key: 'submitted' as const, label: 'Submissions',   total: profile.submittedRequests.length, filtered: filteredSubmissions.length, isFiltered: isSubFiltered, show: true         },
              { key: 'assigned'  as const, label: 'Assigned Work', total: profile.assignedRequests.length,  filtered: filteredAssigned.length,    isFiltered: isAsgFiltered, show: !isAssociate },
              { key: 'comments'  as const, label: 'Comments',      total: profile.comments.length,          filtered: filteredComments.length,    isFiltered: isComFiltered, show: true         },
            ]).filter(t => t.show).map(({ key, label, total, filtered, isFiltered }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                  tab === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  tab === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isFiltered ? `${filtered}/${total}` : total}
                </span>
              </button>
            ))}
          </div>

          {/* Submissions tab */}
          {tab === 'submitted' && (
            <>
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2 items-center">
                <input
                  type="text" placeholder="Search title…" value={subSearch}
                  onChange={e => setSubSearch(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-44"
                />
                <select value={subStatus} onChange={e => setSubStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700">
                  <option value="">All statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                <select value={subPriority} onChange={e => setSubPriority(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700">
                  <option value="">All priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <input type="date" value={subFrom} onChange={e => setSubFrom(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                />
                <input type="date" value={subTo} onChange={e => setSubTo(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                />
                {isSubFiltered && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-500">{filteredSubmissions.length} of {profile.submittedRequests.length}</span>
                    <button
                      onClick={() => { setSubSearch(''); setSubStatus(''); setSubPriority(''); setSubFrom(''); setSubTo(''); }}
                      className="text-xs text-blue-600 hover:underline">
                      Clear
                    </button>
                  </div>
                )}
              </div>
              {filteredSubmissions.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400 italic">
                  {isSubFiltered ? 'No submissions match your filters.' : 'No submissions yet.'}
                </p>
              ) : (
                <RecentRequestsTable requests={filteredSubmissions} />
              )}
            </>
          )}

          {/* Assigned Work tab */}
          {tab === 'assigned' && (
            <>
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2 items-center">
                <input
                  type="text" placeholder="Search title…" value={asgSearch}
                  onChange={e => setAsgSearch(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-44"
                />
                <select value={asgStatus} onChange={e => setAsgStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700">
                  <option value="">All statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                <select value={asgPriority} onChange={e => setAsgPriority(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700">
                  <option value="">All priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <input type="date" value={asgFrom} onChange={e => setAsgFrom(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                />
                <input type="date" value={asgTo} onChange={e => setAsgTo(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                />
                {isAsgFiltered && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-500">{filteredAssigned.length} of {profile.assignedRequests.length}</span>
                    <button
                      onClick={() => { setAsgSearch(''); setAsgStatus(''); setAsgPriority(''); setAsgFrom(''); setAsgTo(''); }}
                      className="text-xs text-blue-600 hover:underline">
                      Clear
                    </button>
                  </div>
                )}
              </div>
              {filteredAssigned.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400 italic">
                  {isAsgFiltered ? 'No assigned requests match your filters.' : 'No assigned requests yet.'}
                </p>
              ) : (
                <RecentRequestsTable requests={filteredAssigned} />
              )}
            </>
          )}

          {/* Comments tab */}
          {tab === 'comments' && (
            <>
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2 items-center">
                <input
                  type="text" placeholder="Search comments or request…" value={comSearch}
                  onChange={e => setComSearch(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-56"
                />
                <input type="date" value={comFrom} onChange={e => setComFrom(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                />
                <input type="date" value={comTo} onChange={e => setComTo(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                />
                {isComFiltered && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-500">{filteredComments.length} of {profile.comments.length}</span>
                    <button
                      onClick={() => { setComSearch(''); setComFrom(''); setComTo(''); }}
                      className="text-xs text-blue-600 hover:underline">
                      Clear
                    </button>
                  </div>
                )}
              </div>
              {filteredComments.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400 italic">
                  {isComFiltered ? 'No comments match your filters.' : 'No comments yet.'}
                </p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {filteredComments.map(c => (
                    <li key={c.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <Link to={`/requests/${c.requestId}`} className="text-xs text-blue-600 hover:underline font-medium">
                          {c.requestTitle}
                        </Link>
                        <span className="text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

      </main>

      {showEdit && (
        <EditUserModal
          profile={profile}
          teams={teams}
          onClose={() => setShowEdit(false)}
          onSaved={updated => setProfile(updated)}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
