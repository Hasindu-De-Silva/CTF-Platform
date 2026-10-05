export type Role = 'PLAYER' | 'ADMIN';

export interface User {
  username: string;
  role: Role;
}

export interface HintTier {
  tier: number;
  penalty: number;
  unlocked: boolean;
  text?: string | null;
}

export interface UnlockHintResponse {
  success: boolean;
  tier: number;
  penaltyDeducted: number;
  hintText: string;
  message: string;
}

export interface PlayerChallenge {
  id: number;
  stageOrder: number;
  title: string;
  domain: string;
  difficulty: string;
  description: string;
  hint: string;
  hints?: HintTier[];
  penaltyDeducted?: number;
  points: number;
  solved: boolean;
  artifactUrl?: string | null;
  targetUrl?: string | null;
}

export interface AdminChallenge {
  id: number;
  stageOrder: number;
  title: string;
  domain: string;
  difficulty: string;
  description: string;
  hint: string;
  hint1?: string;
  hint2?: string;
  hint3?: string;
  points: number;
  active: boolean;
  artifactUrl?: string | null;
  targetUrl?: string | null;
}

export interface AdminChallengeRequest {
  stageOrder: number;
  title: string;
  domain: string;
  difficulty: string;
  description: string;
  hint: string;
  hint1?: string;
  hint2?: string;
  hint3?: string;
  points: number;
  flag: string;
  artifactUrl?: string | null;
  targetUrl?: string | null;
  active?: boolean;
}

export interface SubmitFlagResponse {
  correct: boolean;
  message: string;
  pointsAwarded: number;
}

export interface ScoreboardEntry {
  username: string;
  totalPoints: number;
  solvedCount: number;
}

export interface SubmissionLog {
  id: number;
  user: {
    id: number;
    username: string;
  };
  challenge: {
    id: number;
    title: string;
    stageOrder: number;
    points: number;
  };
  submittedFlag: string;
  correct: boolean;
  submittedAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  role: Role;
  totalScore: number;
  solvedCount: number;
  submissionCount: number;
}
