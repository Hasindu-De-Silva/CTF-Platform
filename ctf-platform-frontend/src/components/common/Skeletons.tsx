import React from 'react';

/* ────────────── Shimmer pulse keyframe is handled via Tailwind animate-pulse ── */

/** Full-width rectangular skeleton bar */
export const SkeletonBar: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div
    className={`rounded-lg bg-slate-800/70 animate-pulse ${className}`}
    aria-hidden
  />
);

/** Card-shaped skeleton for the challenges grid */
export const SkeletonChallengeCard: React.FC = () => (
  <div className="rounded-2xl border border-slate-800 bg-cyber-900/60 p-6 space-y-4 animate-pulse">
    {/* Top row: stage badge + difficulty */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SkeletonBar className="w-16 h-5" />
        <SkeletonBar className="w-14 h-5" />
      </div>
      <SkeletonBar className="w-16 h-5 rounded-full" />
    </div>

    {/* Domain */}
    <SkeletonBar className="w-28 h-3" />

    {/* Title */}
    <SkeletonBar className="w-3/4 h-5" />

    {/* Description lines */}
    <div className="space-y-2">
      <SkeletonBar className="w-full h-3" />
      <SkeletonBar className="w-5/6 h-3" />
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
      <SkeletonBar className="w-20 h-3" />
      <SkeletonBar className="w-24 h-3" />
    </div>
  </div>
);

/** Scoreboard row skeleton */
export const SkeletonScoreboardRow: React.FC = () => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-cyber-900/40 animate-pulse">
    <SkeletonBar className="w-8 h-8 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBar className="w-32 h-4" />
      <SkeletonBar className="w-20 h-3" />
    </div>
    <SkeletonBar className="w-16 h-6 rounded-full" />
  </div>
);

/** Podium card skeleton for top-3 scoreboard */
export const SkeletonPodiumCard: React.FC = () => (
  <div className="p-6 rounded-2xl bg-cyber-900/60 border border-slate-800 flex flex-col items-center text-center space-y-3 animate-pulse">
    <SkeletonBar className="w-14 h-14 rounded-2xl" />
    <SkeletonBar className="w-24 h-4" />
    <SkeletonBar className="w-16 h-6 rounded-full" />
    <SkeletonBar className="w-20 h-3" />
  </div>
);

/** Dashboard stat card skeleton */
export const SkeletonStatCard: React.FC = () => (
  <div className="p-5 rounded-2xl bg-cyber-900/60 border border-slate-800 space-y-3 animate-pulse">
    <SkeletonBar className="w-20 h-3" />
    <SkeletonBar className="w-16 h-8" />
    <SkeletonBar className="w-24 h-3" />
  </div>
);

/** Active challenge panel skeleton */
export const SkeletonActiveChallenge: React.FC = () => (
  <div className="rounded-2xl border border-slate-800 bg-cyber-900/60 p-6 sm:p-8 space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/90">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <SkeletonBar className="w-20 h-6" />
          <SkeletonBar className="w-28 h-6" />
          <SkeletonBar className="w-16 h-6" />
        </div>
        <SkeletonBar className="w-60 h-7" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBar className="w-24 h-9 rounded-xl" />
        <SkeletonBar className="w-28 h-9 rounded-xl" />
      </div>
    </div>

    {/* Description */}
    <div className="space-y-2">
      <SkeletonBar className="w-48 h-3" />
      <div className="p-5 rounded-2xl bg-cyber-950/90 border border-slate-800/90 space-y-2">
        <SkeletonBar className="w-full h-3" />
        <SkeletonBar className="w-full h-3" />
        <SkeletonBar className="w-4/5 h-3" />
        <SkeletonBar className="w-3/4 h-3" />
      </div>
    </div>

    {/* Flag input */}
    <div className="space-y-3 pt-2">
      <SkeletonBar className="w-32 h-3" />
      <SkeletonBar className="w-full h-12 rounded-xl" />
      <SkeletonBar className="w-32 h-10 rounded-xl" />
    </div>
  </div>
);
