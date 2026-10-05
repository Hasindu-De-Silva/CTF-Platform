import React, { useState, useEffect } from 'react';
import type { AdminUser } from '../types/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Loader2,
  Shield,
  User as UserIcon,
  CheckCircle2,
  Award,
  Sparkles,
} from 'lucide-react';

export const AdminUsersView: React.FC = () => {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PLAYER' | 'ADMIN'>('ALL');

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.admin.listUsers();
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch users list');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await api.admin.deleteUser(userToDelete.id);
      setActionSuccess(`User "${userToDelete.username}" and all their submissions have been deleted.`);
      setUserToDelete(null);
      await fetchUsers();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete user.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Stats
  const totalUsers = users.length;
  const totalPlayers = users.filter((u) => u.role === 'PLAYER').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <Users className="w-3.5 h-3.5" /> User Directory
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            User Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage registered player and administrator accounts. Delete members to reset participant progress.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-cyber-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Total Accounts
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {totalUsers}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Players
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {totalPlayers}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Administrators
            </span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {totalAdmins}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-cyber-900/60 border border-slate-800">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username..."
            className="w-full pl-10 pr-4 py-2 bg-cyber-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center bg-cyber-950 border border-slate-800 rounded-xl p-1 text-xs">
          {(['ALL', 'PLAYER', 'ADMIN'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setRoleFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                roleFilter === st
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Roles' : st.charAt(0) + st.slice(1).toLowerCase() + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading user directory...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <p className="text-sm text-rose-300">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-cyber-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 w-20">ID</th>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5 text-center">Score</th>
                  <th className="px-6 py-3.5 text-center">Solved</th>
                  <th className="px-6 py-3.5 text-center">Submissions</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      No matching user records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const isCurrent =
                      currentAuthUser?.username.toLowerCase() === u.username.toLowerCase();
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-6 py-4 font-mono text-slate-500">
                          #{u.id}
                        </td>

                        {/* Username */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-mono font-semibold text-white">
                                {u.username}
                              </span>
                              {isCurrent && (
                                <span className="ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          {u.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-mono">
                              <Sparkles className="w-3 h-3" /> ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
                              PLAYER
                            </span>
                          )}
                        </td>

                        {/* Total Score */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-cyan-400">
                            <Award className="w-3.5 h-3.5" /> {u.totalScore} pts
                          </span>
                        </td>

                        {/* Solved Tasks */}
                        <td className="px-6 py-4 text-center">
                          <span className="font-mono text-slate-300">
                            {u.solvedCount}
                          </span>
                        </td>

                        {/* Submissions */}
                        <td className="px-6 py-4 text-center">
                          <span className="font-mono text-slate-400">
                            {u.submissionCount} attempts
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => setUserToDelete(u)}
                            title={isCurrent ? 'Cannot delete active logged-in account' : `Delete ${u.username}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-cyber-900 border border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Delete Account
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete user <span className="font-mono font-semibold text-white px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">{userToDelete.username}</span>?
            </p>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 space-y-1">
              <p className="font-semibold">⚠️ Deletion Impact:</p>
              <p>• All {userToDelete.submissionCount} submission attempt records for this user will be removed.</p>
              <p>• Their score ({userToDelete.totalScore} pts) will be cleared from the scoreboard.</p>
              <p>• This action cannot be undone.</p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-cyber-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl shadow-lg shadow-rose-600/25 transition-all"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
