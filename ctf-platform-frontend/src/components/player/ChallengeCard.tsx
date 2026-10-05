import React from 'react';
import type { PlayerChallenge } from '../../types/api';
import { Badge, getDifficultyVariant } from '../common/Badge';
import { CheckCircle2, ChevronRight, Award, HelpCircle, Lock } from 'lucide-react';

interface ChallengeCardProps {
  challenge: PlayerChallenge;
  onClick: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Stage ${challenge.stageOrder}: ${challenge.title}${challenge.solved ? ' (solved)' : ''}`}
      className={`group relative rounded-2xl p-6 transition-all duration-300 cursor-pointer text-left border overflow-hidden hover:-translate-y-1 ${
        challenge.solved
          ? 'bg-gradient-to-b from-slate-900/90 to-emerald-950/20 border-emerald-500/40 hover:border-emerald-400/60 shadow-lg shadow-emerald-950/20 hover:shadow-emerald-900/30'
          : 'bg-cyber-900/80 hover:bg-cyber-850 border-slate-800 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/30'
      }`}
    >
      {/* Accent bar that reveals on hover */}
      <span
        aria-hidden
        className={`absolute left-0 top-0 h-full w-1 transition-all duration-300 ${
          challenge.solved
            ? 'bg-emerald-400/70'
            : 'bg-cyan-400/0 group-hover:bg-cyan-400/70'
        }`}
      />

      {/* Soft radial glow on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Top status row */}
      <div className="relative flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700/60">
            Stage {challenge.stageOrder}
          </span>
          <Badge variant={getDifficultyVariant(challenge.difficulty)}>
            {challenge.difficulty}
          </Badge>
        </div>

        {challenge.solved ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Solved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 font-semibold">
            <Award className="w-3.5 h-3.5" />
            {challenge.points} pts
          </span>
        )}
      </div>

      {/* Domain tag */}
      <p className="relative text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
        {challenge.domain}
      </p>

      {/* Title */}
      <h3 className="relative text-lg font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
        {challenge.title}
      </h3>

      {/* Description preview */}
      <p className="relative text-sm text-slate-400 line-clamp-2 mb-5 leading-relaxed">
        {challenge.description || 'No description provided.'}
      </p>

      {/* Footer */}
      <div className="relative flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          {challenge.hint ? (
            <span className="flex items-center gap-1 text-[11px] text-amber-400/80">
              <HelpCircle className="w-3 h-3" /> Hints available
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-slate-600">
              <Lock className="w-3 h-3" /> No hints
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-cyan-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
          {challenge.solved ? 'Review details' : 'Open challenge'}
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
