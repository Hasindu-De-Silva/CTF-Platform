import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { PlayerChallenge, ScoreboardEntry } from '../types/api';
import { api } from '../services/api';
import { SkeletonStatCard } from '../components/common/Skeletons';
import {
  Shield,
  Trophy,
  Target,
  ChevronRight,
  Zap,
  Crosshair,
  Award,
  CheckCircle2,
  ArrowRight,
  Flame,
  BarChart3,
  Clock,
  Sparkles,
  Lock,
  Loader2,
} from 'lucide-react';

/* ────────── stage icon + color map ────────── */
const stageThemes: Record<number, { icon: React.ReactNode; gradient: string; glow: string }> = {
  1: {
    icon: <Crosshair className="w-5 h-5" />,
    gradient: 'from-blue-500/20 to-cyan-500/10',
    glow: 'shadow-blue-500/15',
  },
  2: {
    icon: <Shield className="w-5 h-5" />,
    gradient: 'from-violet-500/20 to-purple-500/10',
    glow: 'shadow-violet-500/15',
  },
  3: {
    icon: <Lock className="w-5 h-5" />,
    gradient: 'from-amber-500/20 to-orange-500/10',
    glow: 'shadow-amber-500/15',
  },
  4: {
    icon: <Target className="w-5 h-5" />,
    gradient: 'from-rose-500/20 to-pink-500/10',
    glow: 'shadow-rose-500/15',
  },
  5: {
    icon: <BarChart3 className="w-5 h-5" />,
    gradient: 'from-teal-500/20 to-emerald-500/10',
    glow: 'shadow-teal-500/15',
  },
  6: {
    icon: <Flame className="w-5 h-5" />,
    gradient: 'from-orange-500/20 to-red-500/10',
    glow: 'shadow-orange-500/15',
  },
  7: {
    icon: <Zap className="w-5 h-5" />,
    gradient: 'from-indigo-500/20 to-blue-500/10',
    glow: 'shadow-indigo-500/15',
  },
  8: {
    icon: <Sparkles className="w-5 h-5" />,
    gradient: 'from-yellow-500/20 to-amber-500/10',
    glow: 'shadow-yellow-500/15',
  },
};

const defaultTheme = {
  icon: <Shield className="w-5 h-5" />,
  gradient: 'from-cyan-500/20 to-blue-500/10',
  glow: 'shadow-cyan-500/15',
};

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<PlayerChallenge[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [challs, scores] = await Promise.all([
          api.challenges.list(),
          api.scoreboard.get(),
        ]);
        setChallenges([...challs].sort((a, b) => a.stageOrder - b.stageOrder));
        setScoreboard([...scores].sort((a, b) => b.totalPoints - a.totalPoints));
      } catch {
        // Non-critical — dashboard gracefully shows empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── derived stats ── */
  const solvedCount = challenges.filter((c) => c.solved).length;
  const totalCount = challenges.length;
  const earnedPoints = challenges
    .filter((c) => c.solved)
    .reduce((s, c) => s + Math.max(0, c.points - (c.penaltyDeducted || 0)), 0);
  const maxPoints = challenges.reduce((s, c) => s + c.points, 0);
  const progressPct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const allSolved = totalCount > 0 && solvedCount === totalCount;

  const nextUnsolved = challenges.find((c) => !c.solved);

  const myRank = scoreboard.findIndex(
    (e) => e.username === user?.username,
  );
  const myRankDisplay = myRank >= 0 ? myRank + 1 : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ═══════════ HERO BANNER ═══════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyber-900 via-cyber-950 to-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        {/* Decorative glow orbs */}
        <span
          aria-hidden
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none"
        />
        <span
          aria-hidden
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-indigo-500/8 blur-3xl pointer-events-none"
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono">
              <Shield className="w-3.5 h-3.5" /> OPERATION AEGIS BREACH
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gradient-cyan leading-tight">
              Welcome back, {user?.username || 'Operator'}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              At 02:40 UTC, security alarms sounded across HexaTech Core Grid Facility. Senior
              infrastructure engineer Marcus Vance initiated an unauthorized insider sabotage
              sequence and fled. Your mission: trace his footprint, decode his communications,
              exploit his backdoors, and neutralize the threat — across 8 escalating stages.
            </p>
          </div>

          {/* Big progress ring */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#progress-gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - progressPct / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={allSolved ? '#facc15' : '#06b6d4'} />
                    <stop offset="100%" stopColor={allSolved ? '#34d399' : '#6366f1'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono ${
                    allSolved ? 'text-yellow-400' : 'text-cyan-400'
                  }`}
                >
                  {progressPct}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">COMPLETE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ STAT CARDS ═══════════ */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
          {/* Score */}
          <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Score
            </span>
            <span
              className={`text-3xl font-black font-mono ${
                allSolved ? 'text-yellow-400' : 'text-cyan-400'
              }`}
            >
              {earnedPoints}
            </span>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Award className="w-3 h-3" /> of {maxPoints} possible
            </span>
          </div>

          {/* Flags */}
          <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Flags Captured
            </span>
            <span className="text-3xl font-black font-mono text-emerald-400">
              {solvedCount}
            </span>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> of {totalCount} stages
            </span>
          </div>

          {/* Rank */}
          <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Current Rank
            </span>
            <span className="text-3xl font-black font-mono text-amber-400">
              {myRankDisplay !== null ? `#${myRankDisplay}` : '—'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Trophy className="w-3 h-3" /> of {scoreboard.length} players
            </span>
          </div>

          {/* Next Stage */}
          <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Next Stage
            </span>
            <span className="text-3xl font-black font-mono text-indigo-400">
              {nextUnsolved ? `S${nextUnsolved.stageOrder}` : '✓'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />{' '}
              {nextUnsolved ? nextUnsolved.domain : 'All completed!'}
            </span>
          </div>
        </div>
      )}

      {/* ═══════════ STAGE ROADMAP ═══════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" /> Mission Stages
          </h2>
          <button
            onClick={() => navigate('/challenges')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View all challenges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {challenges.map((c) => {
              const theme = stageThemes[c.stageOrder] || defaultTheme;
              return (
                <button
                  key={c.id}
                  onClick={() => navigate('/challenges')}
                  className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 overflow-hidden hover:-translate-y-0.5 ${
                    c.solved
                      ? 'bg-gradient-to-b from-emerald-950/30 to-cyber-900 border-emerald-500/30 hover:border-emerald-400/50'
                      : nextUnsolved?.id === c.id
                      ? 'bg-gradient-to-b from-cyan-950/30 to-cyber-900 border-cyan-500/40 hover:border-cyan-400/60 ring-1 ring-cyan-500/20'
                      : 'bg-cyber-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Corner glow */}
                  <span
                    aria-hidden
                    className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${theme.gradient}`}
                  />

                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} border border-slate-700/50 flex items-center justify-center text-slate-300 shadow-lg ${theme.glow}`}
                      >
                        {theme.icon}
                      </div>
                      {c.solved ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : nextUnsolved?.id === c.id ? (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
                          ACTIVE
                        </span>
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        Stage {c.stageOrder} • {c.domain}
                      </p>
                      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1 mt-0.5">
                        {c.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className={`font-mono font-semibold ${
                          c.solved ? 'text-emerald-400' : 'text-cyan-400'
                        }`}
                      >
                        {c.solved
                          ? `${Math.max(0, c.points - (c.penaltyDeducted || 0))} pts earned`
                          : `${c.points} pts`}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════ QUICK ACTIONS ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CTA: Continue Mission */}
        <button
          onClick={() => navigate('/challenges')}
          className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-cyan-600/15 to-indigo-600/10 border border-cyan-500/30 hover:border-cyan-400/50 text-left transition-all duration-300 hover:-translate-y-0.5"
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-900/20">
              <Target className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">
                {allSolved ? 'Review Completed Stages' : 'Continue Mission'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {allSolved
                  ? 'All 8 stages completed — review your work'
                  : `Stage ${nextUnsolved?.stageOrder || '?'}: ${nextUnsolved?.title || 'Unknown'}`}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* CTA: Scoreboard */}
        <button
          onClick={() => navigate('/scoreboard')}
          className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-amber-600/10 to-yellow-600/5 border border-amber-500/25 hover:border-amber-400/40 text-left transition-all duration-300 hover:-translate-y-0.5"
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-900/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">Scoreboard & Rankings</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {myRankDisplay
                  ? `You are ranked #${myRankDisplay} of ${scoreboard.length} players`
                  : 'View live leaderboard standings'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
