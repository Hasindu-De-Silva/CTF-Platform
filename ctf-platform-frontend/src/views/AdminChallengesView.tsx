import React, { useState, useEffect } from 'react';
import type { AdminChallenge, AdminChallengeRequest } from '../types/api';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ChallengeFormModal } from '../components/admin/ChallengeFormModal';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { byStageOrder, getDifficultyVariant } from '../utils/challenge';
import { getErrorMessage } from '../utils/errors';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const AdminChallengesView: React.FC = () => {
  const { addToast } = useToast();
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<AdminChallenge | null>(null);

  const [deletingChallenge, setDeletingChallenge] = useState<AdminChallenge | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.admin.listChallenges();
      const sorted = [...data].sort(byStageOrder);
      setChallenges(sorted);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch admin challenges'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (challenge: AdminChallenge) => {
    setEditingChallenge(challenge);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: AdminChallengeRequest) => {
    try {
      if (editingChallenge) {
        const updated = await api.admin.updateChallenge(editingChallenge.id, data);
        setChallenges((prev) => prev.map((c) => (c.id === updated.id ? updated : c)).sort(byStageOrder));
        addToast(`Challenge "${updated.title}" updated`, 'success');
      } else {
        const created = await api.admin.createChallenge(data);
        setChallenges((prev) => [...prev, created].sort(byStageOrder));
        addToast(`Challenge "${created.title}" created`, 'success');
      }
    } catch (err: unknown) {
      addToast(getErrorMessage(err, 'Failed to save challenge'), 'error');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChallenge) return;
    setDeleteLoading(true);
    try {
      await api.admin.deleteChallenge(deletingChallenge.id);
      setChallenges((prev) => prev.filter((c) => c.id !== deletingChallenge.id));
      addToast(`Challenge deleted successfully`, 'success');
      setDeletingChallenge(null);
    } catch (err: unknown) {
      addToast(getErrorMessage(err, 'Failed to delete challenge'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Stats
  const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);
  const activeCount = challenges.filter((c) => c.active).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <Layers className="w-3.5 h-3.5" /> Admin Control Panel
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Challenge Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, update parameters, replace flags, and configure visibility for all CTF stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchChallenges}
            title="Refresh list"
            className="p-2.5 rounded-xl bg-cyber-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Challenge</span>
          </button>
        </div>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Configured Challenges
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {challenges.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Active / Visible
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {activeCount}{' '}
            <span className="text-xs text-slate-500 font-normal">
              ({challenges.length > 0 ? Math.round((activeCount / challenges.length) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cyber-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Total Points Cap
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {totalPoints} pts
          </div>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading challenge definitions...</p>
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
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-cyber-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 w-16">Stage</th>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Domain</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5 text-center">Points</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {challenges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      No challenges found. Click "New Challenge" to create one.
                    </td>
                  </tr>
                ) : (
                  challenges.map((challenge) => (
                    <tr
                      key={challenge.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Stage Order */}
                      <td className="px-6 py-4 font-mono font-bold text-cyan-400">
                        #{challenge.stageOrder}
                      </td>

                      {/* Title & description preview */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-100 mb-0.5">
                          {challenge.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                          {challenge.description || 'No description'}
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-300 text-[11px]">
                          {challenge.domain}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="px-6 py-4">
                        <Badge variant={getDifficultyVariant(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </td>

                      {/* Points */}
                      <td className="px-6 py-4 text-center font-mono font-semibold text-slate-200">
                        {challenge.points}
                      </td>

                      {/* Active Status */}
                      <td className="px-6 py-4 text-center">
                        {challenge.active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                            <XCircle className="w-3 h-3" /> Hidden
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(challenge)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                            title="Edit Challenge"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingChallenge(challenge)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Challenge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <ChallengeFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingChallenge}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingChallenge}
        onClose={() => setDeletingChallenge(null)}
        title="Confirm Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-left">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>
              Are you sure you want to delete{' '}
              <strong className="text-white">"{deletingChallenge?.title}"</strong>? This will also remove all player submissions linked to this challenge.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingChallenge(null)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteLoading}
              onClick={handleDeleteConfirm}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl shadow-lg shadow-rose-600/20"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
