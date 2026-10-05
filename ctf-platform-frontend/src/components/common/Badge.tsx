import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'easy' | 'moderate' | 'hard' | 'cyan' | 'purple' | 'gray' | 'solved' | 'unsolved';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className = '' }) => {
  const variantStyles = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    gray: 'bg-slate-800 text-slate-400 border-slate-700',
    solved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    unsolved: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const getDifficultyVariant = (difficulty: string) => {
  const diff = difficulty?.toLowerCase() || '';
  if (diff.includes('easy')) return 'easy';
  if (diff.includes('mod') && diff.includes('hard')) return 'hard';
  if (diff.includes('mod')) return 'moderate';
  if (diff.includes('hard')) return 'hard';
  return 'gray';
};
