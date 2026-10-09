import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlayerChallenge, SubmitFlagResponse } from '../types/api';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { ChallengeCard } from '../components/player/ChallengeCard';
import { CompletionModal } from '../components/player/CompletionModal';
import { SkeletonChallengeCard, SkeletonActiveChallenge } from '../components/common/Skeletons';
import {
  areAllSolved,
  byStageOrder,
  getDifficultyVariant,
  getLaunchTarget,
  getNetPoints,
  withHintUnlocked,
} from '../utils/challenge';
import { getErrorMessage } from '../utils/errors';
import {
  Trophy,
  CheckCircle2,
  Filter,
  Search,
  Loader2,
  RefreshCw,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SkipForward,
  Flag,
  Lightbulb,
  Send,
  AlertTriangle,
  Sparkles,
  ArrowDownCircle,
  PartyPopper,
  Download,
  ExternalLink,
  Lock,
  Unlock,
  RotateCcw,
} from 'lucide-react';

const TIER_TITLES: Record<number, string> = {
  1: 'Tier 1: Subtle Orientation Clue (-10% points)',
  2: 'Tier 2: Methodological / Tooling Guide (-15% points)',
  3: 'Tier 3: Explicit Solution Blueprint (-25% points)',
};

export const ChallengesView: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [challenges, setChallenges] = useState<PlayerChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Challenge (One-by-one presentation)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Inline Flag submission state for the active challenge
  const [flagInput, setFlagInput] = useState('');
  const [unlockingTier, setUnlockingTier] = useState<number | null>(null);
  const [confirmUnlockTier, setConfirmUnlockTier] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<SubmitFlagResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Completion modal state
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [confirmResetId, setConfirmResetId] = useState<number | null>(null);

  // Filters for the "All Challenges" scroll-down section
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');

  // Refs for smooth scrolling
  const activeTaskRef = useRef<HTMLDivElement>(null);
  const allTasksRef = useRef<HTMLDivElement>(null);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.challenges.list();
      const sorted = [...data].sort(byStageOrder);
      setChallenges(sorted);

      // Default active challenge to first unsolved challenge if available
      const firstUnsolvedIdx = sorted.findIndex((c) => !c.solved);
      if (firstUnsolvedIdx !== -1) {
        setCurrentIndex(firstUnsolvedIdx);
      } else {
        setCurrentIndex(0);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load challenges from server'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Reset flag input and hint states when active challenge changes
  useEffect(() => {
    setFlagInput('');
    setConfirmUnlockTier(null);
    setConfirmResetId(null);
    setFeedback(null);
    setSubmitError(null);
  }, [currentIndex]);

  const activeChallenge = challenges[currentIndex] || null;

  const handleUnlockHint = async (tier: number) => {
    if (!activeChallenge) return;
    setUnlockingTier(tier);
    try {
      const res = await api.challenges.unlockHint(activeChallenge.id, tier);
      if (res.success) {
        const updated = withHintUnlocked(activeChallenge, tier, res);
        setChallenges(challenges.map((c) => (c.id === activeChallenge.id ? updated : c)));
      }
    } catch (err: unknown) {
      addToast(getErrorMessage(err, 'Failed to unlock hint'), 'error');
    } finally {
      setUnlockingTier(null);
      setConfirmUnlockTier(null);
    }
  };

  const handleResetChallenge = async (challengeId: number) => {
    setResettingId(challengeId);
    try {
      const updated = await api.challenges.reset(challengeId);
      setChallenges((prev) => prev.map((c) => (c.id === challengeId ? updated : c)));
      setFlagInput('');
      setFeedback(null);
      setSubmitError(null);
      setConfirmResetId(null);
      addToast(`Stage ${updated.stageOrder} progress reset! Hints re-locked and full points restored.`, 'success');
    } catch (err: unknown) {
      addToast(getErrorMessage(err, 'Failed to reset challenge'), 'error');
    } finally {
      setResettingId(null);
    }
  };

  const handleSelectChallenge = (index: number, smoothScrollToTop = true) => {
    if (index >= 0 && index < challenges.length) {
      setCurrentIndex(index);
      if (smoothScrollToTop && activeTaskRef.current) {
        activeTaskRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleNextChallenge = () => {
    if (currentIndex < challenges.length - 1) {
      handleSelectChallenge(currentIndex + 1);
    }
  };

  const handlePrevChallenge = () => {
    if (currentIndex > 0) {
      handleSelectChallenge(currentIndex - 1);
    }
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChallenge || !flagInput.trim()) return;

    setSubmitting(true);
    setFeedback(null);
    setSubmitError(null);

    try {
      const response = await api.challenges.submitFlag(activeChallenge.id, flagInput.trim());
      setFeedback(response);
      if (response.correct) {
        const updated = { ...activeChallenge, solved: true };
        const nextChallenges = challenges.map((c) => (c.id === activeChallenge.id ? updated : c));
        setChallenges(nextChallenges);

        if (areAllSolved(nextChallenges)) {
          setIsCompletionModalOpen(true);
        }
      }
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err, 'Failed to submit flag. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardClick = (challenge: PlayerChallenge) => {
    // Make it the active task and scroll up to it
    const idx = challenges.findIndex((c) => c.id === challenge.id);
    if (idx !== -1) {
      handleSelectChallenge(idx, true);
    }
  };

  // Derived domains
  const domains = ['ALL', ...Array.from(new Set(challenges.map((c) => c.domain)))];

  // Filtered challenges for scroll-down section
  const query = search.toLowerCase();
  const filtered = challenges.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(query) ||
      c.domain.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query));

    const matchesDomain = selectedDomain === 'ALL' || c.domain === selectedDomain;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SOLVED' && c.solved) ||
      (statusFilter === 'UNSOLVED' && !c.solved);

    return matchesSearch && matchesDomain && matchesStatus;
  });

  // Player Stats
  const totalPoints = challenges
    .filter((c) => c.solved)
    .reduce((sum, c) => sum + getNetPoints(c), 0);

  const maxPoints = challenges.reduce((sum, c) => sum + c.points, 0);
  const solvedCount = challenges.filter((c) => c.solved).length;
  const progressPercent = challenges.length > 0 ? Math.round((solvedCount / challenges.length) * 100) : 0;
  const allSolved = challenges.length > 0 && solvedCount === challenges.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Stats Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome & Overview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-r from-cyber-900 via-cyber-850 to-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Trophy className="w-3.5 h-3.5" /> Stage Challenges Ready
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              CTF Challenge Arena
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Explore hands-on challenges across OSINT, Cryptography, Web Exploitation, Networking, and Digital Forensics. Work through stages one-by-one or scroll down to browse all tasks.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
              <span>Overall Progress</span>
              <span className={`font-mono font-semibold ${allSolved ? 'text-yellow-400' : 'text-cyan-400'}`}>
                {progressPercent}% {allSolved && '• Completed!'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  allSolved
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-emerald-400'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Earned Points
            </span>
            <div className="my-2">
              <span className={`text-3xl font-bold font-mono ${allSolved ? 'text-yellow-400' : 'text-cyan-400'}`}>
                {totalPoints}
              </span>
              <span className="text-xs text-slate-500 font-mono"> / {maxPoints}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-cyan-400/90 font-mono">
              <Award className="w-3.5 h-3.5" /> Total Score
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Flags Solved
            </span>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono text-emerald-400">{solvedCount}</span>
              <span className="text-xs text-slate-500 font-mono"> / {challenges.length}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ALL TASKS FINISHED CELEBRATION HERO BANNER */}
      {/* ========================================================================= */}
      {allSolved && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-cyber-900 to-emerald-500/15 border-2 border-yellow-500/40 p-6 sm:p-7 shadow-2xl shadow-yellow-500/10 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-yellow-500/30 to-amber-400/20 border border-yellow-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20 animate-pulse">
                <Trophy className="w-8 h-8 sm:w-9 sm:h-9 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-mono font-semibold mb-1.5">
                  <PartyPopper className="w-3.5 h-3.5" /> All {challenges.length} Tasks Finished!
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  You Successfully Completed the CTF!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Incredible job, hacker! All challenges have been solved, all flags captured, and maximum score secured ({totalPoints} / {maxPoints} pts).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setIsCompletionModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-cyber-950 bg-gradient-to-r from-yellow-400 to-amber-400 hover:brightness-110 rounded-xl shadow-lg shadow-yellow-500/25 transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyber-950" />
                <span>Victory Summary</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/scoreboard')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200 bg-cyber-950 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Scoreboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading or Error State */}
      {loading ? (
        <div className="space-y-6">
          {/* Skeleton stage selector */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-cyber-900/90 border border-slate-800 animate-pulse">
            <div className="w-16 h-5 bg-slate-800/70 rounded-lg" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-16 h-7 bg-slate-800/70 rounded-xl" />
            ))}
          </div>
          {/* Skeleton active challenge */}
          <SkeletonActiveChallenge />
          {/* Skeleton grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonChallengeCard key={i} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <p className="text-sm text-rose-300">{error}</p>
          <button
            onClick={fetchChallenges}
            className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
          >
            Retry Connection
          </button>
        </div>
      ) : challenges.length === 0 ? (
        <div className="p-12 rounded-2xl bg-cyber-900/40 border border-slate-800 text-center space-y-2">
          <p className="text-sm text-slate-300 font-medium">No challenges configured yet</p>
          <p className="text-xs text-slate-500">Check back later or contact the administrator.</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* ONE-BY-ONE FOCUSED TASK PANEL */}
          {/* ========================================================================= */}
          <div ref={activeTaskRef} className="space-y-4">
            {/* Stage Selector Ribbon */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-cyber-900/90 border border-slate-800 backdrop-blur-md overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Stages:
                </span>
                {challenges.map((c, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectChallenge(idx, false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/40'
                          : c.solved
                          ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
                          : 'bg-cyber-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>Stage {c.stageOrder}</span>
                      {c.solved && (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scroll Down Fast Jump Button */}
              <button
                type="button"
                onClick={() => allTasksRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>Browse All Tasks Below</span>
              </button>
            </div>

            {/* Active Challenge Card */}
            {activeChallenge && (
              <div className="rounded-2xl border border-slate-800 bg-cyber-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
                {/* Header Navigation & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/90">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700/60">
                        Stage {activeChallenge.stageOrder} of {challenges.length}
                      </span>
                      <span className="font-mono text-xs font-medium px-2.5 py-1 rounded-lg bg-cyber-950 text-slate-300 border border-slate-800 uppercase tracking-wider">
                        {activeChallenge.domain}
                      </span>
                      <Badge variant={getDifficultyVariant(activeChallenge.difficulty)}>
                        {activeChallenge.difficulty}
                      </Badge>
                      {activeChallenge.solved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Solved ({getNetPoints(activeChallenge)} pts awarded)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                          <Award className="w-3.5 h-3.5" /> {activeChallenge.points} Points
                          {activeChallenge.penaltyDeducted && activeChallenge.penaltyDeducted > 0 ? (
                            <span className="text-rose-400 font-normal ml-1">(-{activeChallenge.penaltyDeducted} penalty)</span>
                          ) : null}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {activeChallenge.title}
                    </h2>
                  </div>

                  {/* Navigation Buttons: Previous, Reset, & Skip */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={handlePrevChallenge}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-cyber-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    {confirmResetId === activeChallenge.id ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in">
                        <button
                          type="button"
                          disabled={resettingId === activeChallenge.id}
                          onClick={() => handleResetChallenge(activeChallenge.id)}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all"
                        >
                          {resettingId === activeChallenge.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          <span>Confirm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmResetId(null)}
                          className="px-2 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmResetId(activeChallenge.id)}
                        title="Reset this stage (re-locks hints, clears submission, restores full points)"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-cyber-950 border border-slate-800 text-slate-300 hover:text-rose-300 hover:border-rose-500/40 transition-all shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset Stage</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleNextChallenge}
                      disabled={currentIndex >= challenges.length - 1}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      <span>Skip to Next</span>
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Challenge Scenario Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Challenge Scenario & Instructions
                  </h3>
                  <div className="p-5 rounded-2xl bg-cyber-950/90 border border-slate-800/90 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {activeChallenge.description || 'No challenge description provided.'}
                  </div>

                  {/* Challenge Action Links (Artifact Download / Target Box) */}
                  {(activeChallenge.artifactUrl || activeChallenge.targetUrl) && (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {activeChallenge.artifactUrl && (
                        <a
                          href={activeChallenge.artifactUrl}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-all shadow-sm hover:border-cyan-400"
                        >
                          <Download className="w-4 h-4 text-cyan-400" />
                          <span>Download Challenge File</span>
                        </a>
                      )}
                      {activeChallenge.targetUrl && (
                        <a
                          href={getLaunchTarget(activeChallenge.stageOrder, activeChallenge.targetUrl).href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold transition-all shadow-sm hover:border-emerald-400 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 text-emerald-400" />
                          <span>{getLaunchTarget(activeChallenge.stageOrder, activeChallenge.targetUrl).label}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Progressive Hints & Proposed Penalties */}
                {activeChallenge.hints && activeChallenge.hints.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/20 bg-cyber-950/80 overflow-hidden transition-all p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/15">
                      <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Progressive Clues & Point Penalties</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeChallenge.penaltyDeducted && activeChallenge.penaltyDeducted > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                            Penalty Incurred: -{activeChallenge.penaltyDeducted} pts
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            3 escalation tiers (-10% / -15% / -25%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      {activeChallenge.hints.map((h) => {
                        return (
                          <div
                            key={h.tier}
                            className={`p-4 rounded-xl border transition-all ${
                              h.unlocked
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                : 'bg-cyber-900/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                {h.unlocked ? (
                                  <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
                                ) : (
                                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span className="text-xs font-semibold text-slate-200">
                                  {TIER_TITLES[h.tier] || `Tier ${h.tier}`}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                  -{h.penalty} pts
                                </span>
                                {!h.unlocked && (
                                  confirmUnlockTier === h.tier ? (
                                    <div className="flex items-center gap-1.5 animate-in fade-in">
                                      <button
                                        type="button"
                                        disabled={unlockingTier === h.tier}
                                        onClick={() => handleUnlockHint(h.tier)}
                                        className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow transition-all"
                                      >
                                        {unlockingTier === h.tier ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          `Confirm (-${h.penalty} pts)`
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmUnlockTier(null)}
                                        className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmUnlockTier(h.tier)}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all"
                                    >
                                      <Unlock className="w-3.5 h-3.5" />
                                      <span>Unlock Clue</span>
                                    </button>
                                  )
                                )}
                              </div>
                            </div>

                            {h.unlocked && h.text && (
                              <div className="pt-2 text-xs font-mono text-amber-100 bg-cyber-950/70 p-3 rounded-lg border border-amber-500/20 whitespace-pre-wrap leading-relaxed">
                                {h.text}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Solved Status or Inline Flag Submission Form */}
                <div className="pt-2">
                  {activeChallenge.solved ? (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Stage Completed!</p>
                          <p className="text-xs text-emerald-400/80">
                            You captured this flag and earned {getNetPoints(activeChallenge)} points.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        {confirmResetId === activeChallenge.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <button
                              type="button"
                              disabled={resettingId === activeChallenge.id}
                              onClick={() => handleResetChallenge(activeChallenge.id)}
                              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all"
                            >
                              {resettingId === activeChallenge.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5" />
                              )}
                              <span>Confirm Reset</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmResetId(null)}
                              className="px-2 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmResetId(activeChallenge.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-cyber-950 border border-slate-800 text-slate-300 hover:text-rose-300 hover:border-rose-500/40 transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Stage to Retry</span>
                          </button>
                        )}

                        {allSolved ? (
                          <button
                            type="button"
                            onClick={() => setIsCompletionModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-cyber-950 bg-gradient-to-r from-yellow-400 to-amber-400 hover:brightness-110 rounded-xl shadow-lg shadow-yellow-500/20 transition-all"
                          >
                            <PartyPopper className="w-4 h-4 text-cyber-950" />
                            <span>View CTF Completion</span>
                          </button>
                        ) : currentIndex < challenges.length - 1 ? (
                          <button
                            type="button"
                            onClick={handleNextChallenge}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                          >
                            <span>Proceed to Next Stage</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleInlineSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="inlineFlagInput"
                          className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                        >
                          Submit Captured Flag
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <Flag className="w-4 h-4" />
                          </div>
                          <input
                            id="inlineFlagInput"
                            type="text"
                            value={flagInput}
                            onChange={(e) => setFlagInput(e.target.value)}
                            placeholder="CTF{...}"
                            disabled={submitting}
                            className="w-full pl-10 pr-4 py-3 bg-cyber-950 border border-slate-700/90 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      {/* Feedback Alerts */}
                      {feedback && (
                        <div
                          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                            feedback.correct
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          {feedback.correct ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span>{feedback.message}</span>
                        </div>
                      )}

                      {submitError && (
                        <div className="p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{submitError}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={submitting || !flagInput.trim()}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-lg shadow-cyan-600/25 transition-all"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Verifying Flag...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Submit Flag</span>
                            </>
                          )}
                        </button>

                        {currentIndex < challenges.length - 1 && (
                          <button
                            type="button"
                            onClick={handleNextChallenge}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800/60 transition-colors"
                          >
                            <span>Skip this task</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SCROLL DOWN TO EXPLORE ALL CHALLENGES */}
          {/* ========================================================================= */}
          <div ref={allTasksRef} className="pt-8 border-t border-slate-800/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <ChevronDown className="w-5 h-5 text-cyan-400 animate-bounce" />
                  All Challenges Overview
                </h3>
                <p className="text-xs text-slate-400">
                  Click any challenge to open it in the focused view above.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500">
                Showing {filtered.length} of {challenges.length} tasks
              </span>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-cyber-900/60 border border-slate-800">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search challenges or domains..."
                  className="w-full pl-10 pr-4 py-2 bg-cyber-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                {/* Status Filter */}
                <div className="flex items-center bg-cyber-950 border border-slate-800 rounded-xl p-1 text-xs">
                  {(['ALL', 'UNSOLVED', 'SOLVED'] as const).map((st) => (
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

                <button
                  onClick={fetchChallenges}
                  title="Refresh challenges"
                  className="p-2 rounded-xl bg-cyber-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Domain Category Filter Pills */}
            {domains.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-slate-500 flex items-center gap-1 shrink-0 font-medium">
                  <Filter className="w-3.5 h-3.5" /> Domains:
                </span>
                {domains.map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomain(dom)}
                    className={`shrink-0 px-3 py-1 rounded-full transition-colors border ${
                      selectedDomain === dom
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-medium'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            )}

            {/* Challenge Cards Grid */}
            {filtered.length === 0 ? (
              <div className="p-12 rounded-2xl bg-cyber-900/40 border border-slate-800 text-center space-y-2">
                <p className="text-sm text-slate-300 font-medium">No challenges match the filters</p>
                <p className="text-xs text-slate-500">Try modifying your search query or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((challenge) => {
                  const isCurrentActive = challenges[currentIndex]?.id === challenge.id;
                  return (
                    <div
                      key={challenge.id}
                      className={isCurrentActive ? 'ring-2 ring-cyan-500 rounded-2xl' : ''}
                    >
                      <ChallengeCard
                        challenge={challenge}
                        onClick={() => handleCardClick(challenge)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Completion Celebration Modal (all tasks solved) */}
      <CompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        totalPoints={totalPoints}
        totalChallenges={challenges.length}
      />
    </div>
  );
};
