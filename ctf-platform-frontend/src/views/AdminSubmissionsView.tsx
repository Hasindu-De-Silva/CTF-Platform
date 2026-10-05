import React, { useState, useEffect } from 'react';
import type { SubmissionLog } from '../types/api';
import { api } from '../services/api';
import {
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Loader2,
  Clock,
  User as UserIcon,
} from 'lucide-react';

export const AdminSubmissionsView: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL');

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.admin.getSubmissions();
      setSubmissions(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch submissions log');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      (s.user?.username && s.user.username.toLowerCase().includes(search.toLowerCase())) ||
      (s.challenge?.title && s.challenge.title.toLowerCase().includes(search.toLowerCase())) ||
      (s.submittedFlag && s.submittedFlag.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CORRECT' && s.correct) ||
      (statusFilter === 'INCORRECT' && !s.correct);

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Stats
  const totalSubmissions = submissions.length;
  const correctSubmissions = submissions.filter((s) => s.correct).length;
  const successRate =
    totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <FileText className="w-3.5 h-3.5" /> Security Audit
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Submission Attempt Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of all flag submission attempts submitted by players.
          </p>
        </div>

        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-cyber-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Total Flag Attempts
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {totalSubmissions}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Valid Solves
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {correctSubmissions}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Accuracy Rate
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {successRate}%
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
            placeholder="Search by player, challenge, or flag..."
            className="w-full pl-10 pr-4 py-2 bg-cyber-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center bg-cyber-950 border border-slate-800 rounded-xl p-1 text-xs">
          {(['ALL', 'CORRECT', 'INCORRECT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading submission audit logs...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <p className="text-sm text-rose-300">{error}</p>
          <button
            onClick={fetchSubmissions}
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
                  <th className="px-6 py-3.5 w-44">Time</th>
                  <th className="px-6 py-3.5">Player</th>
                  <th className="px-6 py-3.5">Target Challenge</th>
                  <th className="px-6 py-3.5">Submitted String</th>
                  <th className="px-6 py-3.5 text-center">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      No matching submission records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{formatDate(sub.submittedAt)}</span>
                        </div>
                      </td>

                      {/* Player Username */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                            <UserIcon className="w-3 h-3" />
                          </div>
                          <span className="font-mono font-semibold text-slate-200">
                            {sub.user?.username || `User #${sub.user?.id || '?'}`}
                          </span>
                        </div>
                      </td>

                      {/* Challenge Title */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-300">
                          {sub.challenge?.title || `Challenge #${sub.challenge?.id}`}
                        </div>
                        {sub.challenge?.stageOrder && (
                          <span className="text-[10px] font-mono text-cyan-400">
                            Stage {sub.challenge.stageOrder} ({sub.challenge.points} pts)
                          </span>
                        )}
                      </td>

                      {/* Submitted String */}
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 break-all">
                          {sub.submittedFlag}
                        </code>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {sub.correct ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
