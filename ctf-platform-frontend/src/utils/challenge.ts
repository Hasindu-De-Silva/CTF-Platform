import type { BadgeVariant } from '../components/common/Badge';
import type { PlayerChallenge, UnlockHintResponse } from '../types/api';

/** Comparator: ascending stage order. */
export const byStageOrder = (a: { stageOrder: number }, b: { stageOrder: number }): number =>
  a.stageOrder - b.stageOrder;

/**
 * Points a solved challenge is worth: hint penalties are deducted, but a solve
 * is never worth less than half its points (mirrors the backend scoring rule).
 */
export const getNetPoints = (challenge: Pick<PlayerChallenge, 'points' | 'penaltyDeducted'>): number =>
  Math.max(Math.floor(challenge.points / 2), challenge.points - (challenge.penaltyDeducted || 0));

export const areAllSolved = (challenges: PlayerChallenge[]): boolean =>
  challenges.length > 0 && challenges.every((c) => c.solved);

/** Returns a copy of `challenge` with hint `tier` unlocked and its penalty added. */
export const withHintUnlocked = (
  challenge: PlayerChallenge,
  tier: number,
  res: UnlockHintResponse,
): PlayerChallenge => ({
  ...challenge,
  hints: (challenge.hints || []).map((h) =>
    h.tier === tier ? { ...h, unlocked: true, text: res.hintText } : h
  ),
  penaltyDeducted: (challenge.penaltyDeducted || 0) + res.penaltyDeducted,
});

/**
 * Link and button label for a challenge's interactive target. Stages with an
 * in-app workbench open it; stages 3 and 6 keep pointing at the workbenches
 * they used before the stages were renumbered.
 */
export const getLaunchTarget = (stageOrder: number, targetUrl: string): { href: string; label: string } => {
  switch (stageOrder) {
    case 1:
      return { href: '/stage1-osint', label: 'Launch OSINT Investigation' };
    case 3:
    case 4:
      return { href: '/stage4-gateway', label: 'Launch In-App Gateway Portal' };
    case 7:
      return { href: '/stage7-binary', label: 'Launch Binary Workbench' };
    case 6:
    case 8:
      return { href: '/stage8-terminal', label: 'Launch In-App Linux Terminal' };
    default:
      return { href: targetUrl, label: `Launch Target Box (${targetUrl})` };
  }
};

export const getDifficultyVariant = (difficulty: string): BadgeVariant => {
  const diff = difficulty?.toLowerCase() || '';
  if (diff.includes('easy')) return 'easy';
  if (diff.includes('mod') && diff.includes('hard')) return 'hard';
  if (diff.includes('mod')) return 'moderate';
  if (diff.includes('hard')) return 'hard';
  return 'gray';
};
