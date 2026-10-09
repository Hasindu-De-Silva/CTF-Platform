import React, { useState } from 'react';
import type { PlayerChallenge, SubmitFlagResponse } from '../../types/api';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Badge, getDifficultyVariant } from '../common/Badge';
import {
  Flag,
  Lightbulb,
  Award,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Download,
  ExternalLink,
  Lock,
  Unlock,
  RotateCcw,
} from 'lucide-react';

interface ChallengeModalProps {
  challenge: PlayerChallenge | null;
  isOpen: boolean;
  onClose: () => void;
  onSolveSuccess: (updatedChallenge: PlayerChallenge) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onSolveSuccess,
}) => {
  const { addToast } = useToast();
  const [flag, setFlag] = useState('');
  const [unlockingTier, setUnlockingTier] = useState<number | null>(null);
  const [confirmUnlockTier, setConfirmUnlockTier] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<SubmitFlagResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!challenge) return null;

  const handleModalClose = () => {
    setFlag('');
    setUnlockingTier(null);
    setConfirmUnlockTier(null);
    setFeedback(null);
    setErrorMessage(null);
    setConfirmReset(false);
    onClose();
  };

  const handleResetChallenge = async () => {
    if (!challenge) return;
    setResetting(true);
    try {
      const updated = await api.challenges.reset(challenge.id);
      onSolveSuccess(updated);
      setFlag('');
      setFeedback(null);
      setErrorMessage(null);
      setConfirmReset(false);
      addToast(`Stage ${updated.stageOrder} progress reset! Hints re-locked and full points restored.`, 'success');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to reset challenge', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleUnlockHint = async (tier: number) => {
    if (!challenge) return;
    setUnlockingTier(tier);
    try {
      const res = await api.challenges.unlockHint(challenge.id, tier);
      if (res.success) {
        const updatedHints = (challenge.hints || []).map((h) =>
          h.tier === tier ? { ...h, unlocked: true, text: res.hintText } : h
        );
        const newPenalty = (challenge.penaltyDeducted || 0) + res.penaltyDeducted;
        const updated = {
          ...challenge,
          hints: updatedHints,
          penaltyDeducted: newPenalty,
        };
        onSolveSuccess(updated);
        addToast(`Hint Tier ${tier} unlocked (-${res.penaltyDeducted} pts penalty)`, 'info');
      }
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to unlock hint', 'error');
    } finally {
      setUnlockingTier(null);
      setConfirmUnlockTier(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim()) return;

    setSubmitting(true);
    setFeedback(null);
    setErrorMessage(null);

    try {
      const response = await api.challenges.submitFlag(challenge.id, flag.trim());
      setFeedback(response);
      if (response.correct) {
        onSolveSuccess({
          ...challenge,
          solved: true,
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to submit flag. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={`Stage ${challenge.stageOrder}: ${challenge.title}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              {challenge.domain}
            </span>
            <Badge variant={getDifficultyVariant(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>{challenge.points} Points</span>
            </div>

            {confirmReset ? (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <button
                  type="button"
                  disabled={resetting}
                  onClick={handleResetChallenge}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all"
                >
                  {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Confirm Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                title="Reset this stage (re-locks hints, clears submission, restores full points)"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                <span>Reset Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Task Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Challenge Scenario
          </h4>
          <div className="p-4 rounded-xl bg-cyber-950/80 border border-slate-800/80 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {challenge.description || 'No challenge description provided.'}
          </div>
        </div>

        {/* Challenge Action Links (Artifact Download / Target Box) */}
        {(challenge.artifactUrl || challenge.targetUrl) && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {challenge.artifactUrl && (
              <a
                href={challenge.artifactUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-all shadow-sm hover:border-cyan-400"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Challenge Artifact</span>
              </a>
            )}
            {challenge.targetUrl && (
              <a
                href={
                  challenge.stageOrder === 1
                    ? '/stage1-osint'
                    : challenge.stageOrder === 4 || challenge.stageOrder === 3
                    ? '/stage4-gateway'
                    : challenge.stageOrder === 7
                    ? '/stage7-binary'
                    : challenge.stageOrder === 8 || challenge.stageOrder === 6
                    ? '/stage8-terminal'
                    : challenge.targetUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold transition-all shadow-sm hover:border-emerald-400 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>
                  {challenge.stageOrder === 1
                    ? 'Launch OSINT Investigation'
                    : challenge.stageOrder === 4 || challenge.stageOrder === 3
                    ? 'Launch In-App Gateway Portal'
                    : challenge.stageOrder === 7
                    ? 'Launch Binary Workbench'
                    : challenge.stageOrder === 8 || challenge.stageOrder === 6
                    ? 'Launch In-App Linux Terminal'
                    : `Launch Target Box (${challenge.targetUrl})`}
                </span>
              </a>
            )}
          </div>
        )}

        {/* Progressive Hints & Proposed Penalties */}
        {((challenge.hints && challenge.hints.length > 0) || challenge.hint) && (
          <div className="rounded-xl border border-amber-500/20 bg-cyber-950/80 overflow-hidden transition-all p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-500/15">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Progressive Clues & Point Penalties</span>
              </div>
              <div className="flex items-center gap-2">
                {challenge.penaltyDeducted && challenge.penaltyDeducted > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    Penalty: -{challenge.penaltyDeducted} pts
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-mono">
                    3 escalation tiers (-10% / -15% / -25%)
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {challenge.hints && challenge.hints.length > 0 ? (
                challenge.hints.map((h) => {
                  const tierTitles: Record<number, string> = {
                    1: 'Tier 1: Subtle Orientation Clue (-10% pts)',
                    2: 'Tier 2: Methodological Guide (-15% pts)',
                    3: 'Tier 3: Explicit Solution Blueprint (-25% pts)',
                  };

                  return (
                    <div
                      key={h.tier}
                      className={`p-3.5 rounded-xl border transition-all ${
                        h.unlocked
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-cyber-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          {h.unlocked ? (
                            <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-slate-200">
                            {tierTitles[h.tier] || `Tier ${h.tier}`}
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
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Unlock</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {h.unlocked && h.text && (
                        <div className="pt-2 text-xs font-mono text-amber-100 bg-cyber-950/70 p-2.5 rounded-lg border border-amber-500/20 whitespace-pre-wrap leading-relaxed">
                          {h.text}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-xs text-slate-300 font-mono">
                  {challenge.hint}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Solved Banner or Flag Submission Input */}
        {challenge.solved ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Challenge Solved!</p>
                <p className="text-xs text-emerald-400/80">
                  Awarded {Math.max(Math.floor(challenge.points / 2), challenge.points - (challenge.penaltyDeducted || 0))} pts
                  {challenge.penaltyDeducted ? ` (-${challenge.penaltyDeducted} penalty)` : ''}.
                </p>
              </div>
            </div>
            {confirmReset ? (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <button
                  type="button"
                  disabled={resetting}
                  onClick={handleResetChallenge}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all"
                >
                  {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Confirm Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/40 transition-all self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Stage to Retry</span>
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="flagInput"
                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >
                Submit Captured Flag
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Flag className="w-4 h-4" />
                </div>
                <input
                  id="flagInput"
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="CTF{...}"
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-2.5 bg-cyber-950 border border-slate-700/80 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Error or Success feedback */}
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

            {errorMessage && (
              <div className="p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !flag.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-lg shadow-cyan-600/25 transition-all duration-150"
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
          </form>
        )}
      </div>
    </Modal>
  );
};
