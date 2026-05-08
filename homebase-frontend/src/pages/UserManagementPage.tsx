import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getUsers, createUser, toggleUserActive, deleteUser } from '../api/users';
import { getTeams } from '../api/teams';
import type { UserSummary, Team, CreateUserPayload } from '../types';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

// ── Styles ────────────────────────────────────────────────────
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

// ── Create User Modal ─────────────────────────────────────────
interface ModalProps {
  isAdmin: boolean;
  managerTeam: UserSummary['teamId'];
  managerTeamName: UserSummary['teamName'];
  teams: Team[];
  onClose: () => void;
  onCreated: (user: UserSummary) => void;
}

const CreateUserModal = ({ isAdmin, managerTeamName, teams, onClose, onCreated }: ModalProps) => {
  const [form, setForm] = useState<CreateUserPayload>({
    fullName: '', email: '', password: '', role: 'ASSOCIATE', teamId: null,
  });
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof CreateUserPayload, value: string | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const created = await createUser(form);
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? 'Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {isAdmin ? 'Create User' : 'Add Associate to Your Team'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {!isAdmin && managerTeamName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
              Creating <span className="font-medium">Associate</span> for{' '}
              <span className="font-medium">{managerTeamName}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required type="text" value={form.fullName}
              onChange={e => set('fullName', e.target.value)} placeholder="e.g. Jane Smith"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" value={form.email}
              onChange={e => set('email', e.target.value)} placeholder="jane@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
            <input required type="password" value={form.password}
              onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {isAdmin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => set('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="ASSOCIATE">Associate</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <select value={form.teamId ?? ''} onChange={e => set('teamId', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">No team assigned</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
              {submitting ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────
const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [searchParams] = useSearchParams();

  const [users,   setUsers]   = useState<UserSummary[]>([]);
  const [teams,   setTeams]   = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterTeam, setFilterTeam] = useState(searchParams.get('team') ?? '');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');

  // Per-row action state
  const [togglingId,  setTogglingId]  = useState<string | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);  // confirm stage
  const [deleteBusy,  setDeleteBusy]  = useState<string | null>(null);  // network in-flight
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetches = isAdmin
      ? Promise.all([getUsers(), getTeams()]).then(([u, t]) => { setUsers(u); setTeams(t); })
      : getUsers().then(setUsers);
    fetches.finally(() => setLoading(false));
  }, [isAdmin]);

  const handleCreated = (newUser: UserSummary) => setUsers(prev => [newUser, ...prev]);

  const handleToggleActive = async (u: UserSummary) => {
    setTogglingId(u.id);
    try {
      const updated = await toggleUserActive(u.id, !u.active);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, active: updated.active } : x));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteBusy(id);
    setDeleteError(prev => ({ ...prev, [id]: '' }));
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeletingId(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setDeleteError(prev => ({ ...prev, [id]: msg ?? 'Cannot delete user.' }));
      setDeletingId(null);
    } finally {
      setDeleteBusy(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole     = !filterRole || u.role === filterRole;
    const matchTeam     = !filterTeam
      || (filterTeam === '__none__' ? u.teamId === null : u.teamId === filterTeam);
    const joinedDate    = u.createdAt.slice(0, 10);
    const matchDateFrom = !dateFrom || joinedDate >= dateFrom;
    const matchDateTo   = !dateTo   || joinedDate <= dateTo;
    return matchSearch && matchRole && matchTeam && matchDateFrom && matchDateTo;
  });

  const isFiltered = !!(search || filterRole || filterTeam || dateFrom || dateTo);

  const clearFilters = () => {
    setSearch('');
    setFilterRole('');
    setFilterTeam('');
    setDateFrom('');
    setDateTo('');
  };

  const managerRecord = isAdmin ? null : users.find(u => u.email === currentUser?.email) ?? null;
  const managerTeamName = managerRecord?.teamName ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'User Management' : 'My Team Members'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isAdmin
                ? 'Create and manage all user accounts across the store'
                : `Manage associates on your team · ${users.length} member${users.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + {isAdmin ? 'Create User' : 'Add Associate'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
          <input
            type="text" placeholder="Search by name…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Roles</option>
            {isAdmin && <option value="ADMIN">Admin</option>}
            {isAdmin && <option value="MANAGER">Manager</option>}
            <option value="TECHNICIAN">Technician</option>
            <option value="ASSOCIATE">Associate</option>
          </select>
          {isAdmin && (
            <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Teams</option>
              <option value="__none__">No Team</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Joined from</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Results bar */}
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-sm text-gray-500">
            {isFiltered
              ? <><span className="font-medium text-gray-900">{filtered.length}</span> of <span className="font-medium text-gray-900">{users.length}</span> users</>
              : <><span className="font-medium text-gray-900">{users.length}</span> user{users.length !== 1 ? 's' : ''} total</>
            }
          </p>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Role', 'Team', 'Joined', isAdmin ? 'Status' : null, isAdmin ? 'Actions' : null]
                  .filter(Boolean)
                  .map(h => (
                    <th key={h!} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {[...Array(isAdmin ? 7 : 5)].map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 5} className="py-12 text-center text-gray-400 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* Name + avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <Link
                          to={`/users/${u.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {u.fullName}
                        </Link>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-sm text-gray-500">{u.email}</td>

                    {/* Role badge */}
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-4">
                      {u.teamName ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${teamCategoryColors[u.teamCategory ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                          {u.teamName}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No team</span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>

                    {/* Active status */}
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {u.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    )}

                    {/* Actions */}
                    {isAdmin && (
                      <td className="py-3 px-4">
                        {u.id === currentUser?.userId ? (
                          <span className="text-xs text-gray-400 italic">You</span>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleActive(u)}
                                disabled={togglingId === u.id}
                                className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors disabled:opacity-40 ${
                                  u.active
                                    ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                    : 'border-green-200 text-green-600 hover:bg-green-50'
                                }`}
                              >
                                {u.active ? 'Disable' : 'Enable'}
                              </button>

                              {deletingId === u.id ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-red-600 font-medium">Sure?</span>
                                  <button
                                    onClick={() => handleDelete(u.id)}
                                    disabled={deleteBusy === u.id}
                                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => { setDeletingId(null); setDeleteError(prev => ({ ...prev, [u.id]: '' })); }}
                                    className="text-xs px-2 py-1 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(u.id)}
                                  className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            {deleteError[u.id] && (
                              <p className="mt-1 text-xs text-red-500">{deleteError[u.id]}</p>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>

      {showModal && (
        <CreateUserModal
          isAdmin={isAdmin}
          managerTeam={managerRecord?.teamId ?? null}
          managerTeamName={managerTeamName}
          teams={teams}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
