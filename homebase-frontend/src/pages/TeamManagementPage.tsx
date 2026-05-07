import { useEffect, useState } from 'react';
import { getTeams, assignUserToTeam } from '../api/teams';
import { getUsers } from '../api/users';
import type { Team, UserSummary } from '../types';
import Navbar from '../components/Navbar';

const categoryColors: Record<string, string> = {
  IT:         'bg-blue-100 text-blue-700',
  FACILITIES: 'bg-orange-100 text-orange-700',
  HR:         'bg-purple-100 text-purple-700',
  SUPPLY:     'bg-green-100 text-green-700',
  OTHER:      'bg-gray-100 text-gray-600',
};

const roleColors: Record<string, string> = {
  ADMIN:     'bg-red-100 text-red-700',
  MANAGER:   'bg-purple-100 text-purple-700',
  ASSOCIATE: 'bg-blue-100 text-blue-700',
};

const TeamManagementPage = () => {
  const [teams, setTeams]       = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState<Record<string, string>>({}); // teamId → selected userId
  const [saving, setSaving]     = useState<string | null>(null); // userId being updated

  useEffect(() => {
    Promise.all([getTeams(), getUsers()])
      .then(([t, u]) => { setTeams(t); setAllUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (teamId: string) => {
    const userId = adding[teamId];
    if (!userId) return;
    setSaving(userId);
    try {
      await assignUserToTeam(userId, teamId);
      setAllUsers(prev => prev.map(u => u.id === userId
        ? { ...u, teamId, teamName: teams.find(t => t.id === teamId)?.name ?? null }
        : u
      ));
      setTeams(prev => prev.map(t => {
        if (t.id !== teamId) return t;
        const user = allUsers.find(u => u.id === userId)!;
        const updatedUser = { ...user, teamId, teamName: t.name };
        const filtered = t.members.filter(m => m.id !== userId);
        return { ...t, members: [...filtered, updatedUser] };
      }));
      // Remove user from their old team's member list
      setTeams(prev => prev.map(t => {
        if (t.id === teamId) return t;
        return { ...t, members: t.members.filter(m => m.id !== userId) };
      }));
      setAdding(prev => ({ ...prev, [teamId]: '' }));
    } finally {
      setSaving(null);
    }
  };

  const handleRemove = async (userId: string, teamId: string) => {
    setSaving(userId);
    try {
      await assignUserToTeam(userId, null);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, teamId: null, teamName: null } : u));
      setTeams(prev => prev.map(t =>
        t.id === teamId ? { ...t, members: t.members.filter(m => m.id !== userId) } : t
      ));
    } finally {
      setSaving(null);
    }
  };

  const unassignedUsers = allUsers.filter(u => !u.teamId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Assign technicians to teams. Requests are automatically routed to the matching team when created.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Team cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {teams.map(team => {
                const addableUsers = allUsers.filter(u => u.teamId !== team.id);
                return (
                  <div key={team.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Card header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-gray-900">{team.name}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{team.description}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[team.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {team.category}
                      </span>
                    </div>

                    {/* Members */}
                    <div className="px-5 py-3">
                      {team.members.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">No members yet</p>
                      ) : (
                        <ul className="space-y-2">
                          {team.members.map(member => (
                            <li key={member.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {member.fullName.charAt(0)}
                                </div>
                                <span className="text-sm text-gray-800">{member.fullName}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleColors[member.role] ?? 'bg-gray-100 text-gray-600'}`}>
                                  {member.role}
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemove(member.id, team.id)}
                                disabled={saving === member.id}
                                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors px-2 py-1 rounded hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Add member */}
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex gap-2">
                      <select
                        value={adding[team.id] ?? ''}
                        onChange={e => setAdding(prev => ({ ...prev, [team.id]: e.target.value }))}
                        className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a member to add…</option>
                        {addableUsers.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} ({u.role}){u.teamName ? ` — currently: ${u.teamName}` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAdd(team.id)}
                        disabled={!adding[team.id] || saving !== null}
                        className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Unassigned users */}
            {unassignedUsers.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-3">
                  Unassigned Users
                  <span className="ml-2 text-xs font-normal text-gray-400">{unassignedUsers.length} user{unassignedUsers.length !== 1 ? 's' : ''} not on any team</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {unassignedUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                      <span className="text-sm text-gray-700">{u.fullName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleColors[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TeamManagementPage;
