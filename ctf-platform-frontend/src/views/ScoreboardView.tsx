import React, { useState, useEffect, useMemo } from 'react';
import type { ScoreboardEntry } from '../types/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonPodiumCard, SkeletonBar } from '../components/common/Skeletons';
import {
  Trophy,
  Medal,
  Award,
  RefreshCw,
  Crown,
  User as UserIcon,
  Search,
  Sparkles,
  Flame,
  Target,
} from 'lucide-react';

export const ScoreboardView: React.FC = () => {
  const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const fetchScoreboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.scoreboard.get();
      // Server already orders by totalPoints desc, but we ensure stable sort
      const sorted = [...data].sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return b.solvedCount - a.solvedCount;
      });
      setEntries(sorted);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load scoreboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoreboard();
  }, []);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter((e) => e.username.toLowerCase().includes(q));
  }, [entries, searchQuery]);

  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  const totalPointsAwarded = useMemo(() => {
    return entries.reduce((acc, curr) => acc + curr.totalPoints, 0);
  }, [entries]);

  const currentUserRank = useMemo(() => {
    if (!user) return null;
    const index = entries.findIndex((e) => e.username === user.username);
    return index !== -1 ? index + 1 : null;
  }, [entries, user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <Trophy className="w-3.5 h-3.5" /> Live Leaderboard
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Scoreboard & Rankings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time standings based on total points captured and challenges completed.
          </p>
        </div>

        <button
          onClick={fetchScoreboard}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-cyber-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Standings</span>
        </button>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-cyber-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
            <Target className="w-4 h-4 text-cyan-400" /> Total Players
          </div>
          <p className="text-xl font-bold text-white font-mono">{loading ? '...' : entries.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-cyber-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
            <Flame className="w-4 h-4 text-amber-400" /> Leader Score
          </div>
          <p className="text-xl font-bold text-amber-400 font-mono">
            {loading ? '...' : top1 ? `${top1.totalPoints} pts` : '0 pts'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyber-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
            <Sparkles className="w-4 h-4 text-purple-400" /> Total Points Won
          </div>
          <p className="text-xl font-bold text-purple-400 font-mono">
            {loading ? '...' : totalPointsAwarded.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyber-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
            <Crown className="w-4 h-4 text-emerald-400" /> Your Standing
          </div>
          <p className="text-xl font-bold text-emerald-400 font-mono">
            {loading ? '...' : currentUserRank ? `#${currentUserRank}` : 'Unranked'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {/* Podium Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <SkeletonPodiumCard />
            <SkeletonPodiumCard />
            <SkeletonPodiumCard />
          </div>

          {/* Table Skeleton */}
          <div className="rounded-2xl border border-slate-800 bg-cyber-900/80 p-6 space-y-4">
            <SkeletonBar className="w-48 h-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <SkeletonBar className="w-8 h-8 rounded-lg" />
                    <SkeletonBar className="w-32 h-4" />
                  </div>
                  <SkeletonBar className="w-20 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <p className="text-sm text-rose-300">{error}</p>
          <button
            onClick={fetchScoreboard}
            className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium (Shown if at least 1 entry exists) */}
          {entries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* 2nd Place */}
              {top2 ? (
                <div className="order-2 md:order-1 p-6 rounded-2xl bg-cyber-900/90 border border-slate-700/60 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 hover:border-slate-500 hover:shadow-lg hover:shadow-slate-800/50">
                  <div className="w-12 h-12 rounded-full bg-slate-400/10 border border-slate-400/30 flex items-center justify-center text-slate-300 mb-3">
                    <Medal className="w-6 h-6 text-slate-300" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                    2nd Place
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">{top2.username}</h3>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-cyan-400 font-semibold">{top2.totalPoints} pts</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{top2.solvedCount} solved</span>
                  </div>
                </div>
              ) : (
                <div className="hidden md:block order-1" />
              )}

              {/* 1st Place */}
              {top1 && (
                <div className="order-1 md:order-2 p-7 rounded-2xl bg-gradient-to-b from-amber-500/10 via-cyber-900 to-cyber-900 border border-amber-500/40 flex flex-col items-center text-center relative overflow-hidden shadow-xl shadow-amber-950/20 md:-translate-y-2 transition-all duration-300 hover:border-amber-400 hover:shadow-amber-500/20">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/20">
                    <Crown className="w-7 h-7 text-amber-400" />
                  </div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-semibold mb-1">
                    1st Place Champion
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2">{top1.username}</h3>
                  <div className="flex items-center gap-3 text-sm font-mono">
                    <span className="text-amber-400 font-bold">{top1.totalPoints} pts</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{top1.solvedCount} solved</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3 ? (
                <div className="order-3 p-6 rounded-2xl bg-cyber-900/90 border border-slate-700/60 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 hover:border-amber-700/80 hover:shadow-lg hover:shadow-amber-950/40">
                  <div className="w-12 h-12 rounded-full bg-amber-800/10 border border-amber-700/30 flex items-center justify-center text-amber-600 mb-3">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xs font-mono text-amber-600/90 uppercase tracking-wider mb-1">
                    3rd Place
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">{top3.username}</h3>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-cyan-400 font-semibold">{top3.totalPoints} pts</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{top3.solvedCount} solved</span>
                  </div>
                </div>
              ) : (
                <div className="hidden md:block order-3" />
              )}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="rounded-2xl border border-slate-800 bg-cyber-900/80 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 bg-cyber-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">Global Player Standings</h2>
                <span className="text-xs font-mono text-slate-500">
                  {entries.length} {entries.length === 1 ? 'player' : 'players'} enrolled
                </span>
              </div>

              {/* Player Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Find player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/70 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {searchQuery ? `No players found matching "${searchQuery}"` : 'No scores recorded yet. Submit flags to appear on the leaderboard!'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5 w-20">Rank</th>
                      <th className="px-6 py-3.5">Player</th>
                      <th className="px-6 py-3.5 text-center">Solved Challenges</th>
                      <th className="px-6 py-3.5 text-right">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredEntries.map((entry) => {
                      const actualRank = entries.findIndex((e) => e.username === entry.username) + 1;
                      const isCurrentUser = user && user.username === entry.username;

                      return (
                        <tr
                          key={entry.username}
                          className={`transition-colors ${
                            isCurrentUser
                              ? 'bg-cyan-500/10 font-semibold border-l-2 border-l-cyan-400'
                              : 'hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Rank */}
                          <td className="px-6 py-4 font-mono font-bold">
                            {actualRank === 1 ? (
                              <span className="text-amber-400 flex items-center gap-1">
                                <Crown className="w-3.5 h-3.5" /> #1
                              </span>
                            ) : actualRank === 2 ? (
                              <span className="text-slate-300">#2</span>
                            ) : actualRank === 3 ? (
                              <span className="text-amber-600">#3</span>
                            ) : (
                              <span className="text-slate-500">#{actualRank}</span>
                            )}
                          </td>

                          {/* Player Username */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                                <UserIcon className="w-3 h-3" />
                              </div>
                              <span
                                className={`font-mono ${
                                  isCurrentUser ? 'text-cyan-300' : 'text-slate-200'
                                }`}
                              >
                                {entry.username}
                              </span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-sans">
                                  You
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Solved Count */}
                          <td className="px-6 py-4 text-center font-mono text-slate-300">
                            {entry.solvedCount}
                          </td>

                          {/* Total Points */}
                          <td className="px-6 py-4 text-right font-mono font-bold text-cyan-400">
                            {entry.totalPoints} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
