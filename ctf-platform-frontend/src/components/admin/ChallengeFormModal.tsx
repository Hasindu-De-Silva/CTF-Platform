import React, { useState, useEffect } from 'react';
import type { AdminChallenge, AdminChallengeRequest } from '../../types/api';
import { Modal } from '../common/Modal';
import { Loader2, Save, Key, AlertCircle } from 'lucide-react';

interface ChallengeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdminChallengeRequest) => Promise<void>;
  initialData?: AdminChallenge | null;
}

const DEFAULT_DOMAINS = [
  'OSINT / Reconnaissance',
  'Cryptography',
  'Web Technologies / Web Security',
  'Networking',
  'Digital Forensics',
  'Web Security + Digital Forensics',
];

const DIFFICULTIES = ['Easy', 'Moderate', 'Moderate-Hard', 'Hard'];

export const ChallengeFormModal: React.FC<ChallengeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<AdminChallengeRequest>({
    stageOrder: 1,
    title: '',
    domain: DEFAULT_DOMAINS[0],
    difficulty: 'Easy',
    description: '',
    hint: '',
    points: 100,
    flag: '',
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        stageOrder: initialData.stageOrder,
        title: initialData.title,
        domain: initialData.domain,
        difficulty: initialData.difficulty,
        description: initialData.description || '',
        hint: initialData.hint || '',
        points: initialData.points,
        flag: '', // Plaintext flag is not returned by the backend for security
        active: initialData.active,
      });
    } else {
      setFormData({
        stageOrder: 1,
        title: '',
        domain: DEFAULT_DOMAINS[0],
        difficulty: 'Easy',
        description: '',
        hint: '',
        points: 100,
        flag: '',
        active: true,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!initialData && !formData.flag.trim()) {
      setError('Flag is required when creating a challenge');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save challenge');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Challenge: ${initialData.title}` : 'Create New Challenge'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Stage Order (1 - 6)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.stageOrder}
              onChange={(e) =>
                setFormData({ ...formData, stageOrder: parseInt(e.target.value) || 1 })
              }
              className="w-full px-3 py-2 bg-cyber-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Points Value
            </label>
            <input
              type="number"
              min="10"
              step="10"
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: parseInt(e.target.value) || 100 })
              }
              className="w-full px-3 py-2 bg-cyber-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Challenge Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Digital Footprint"
            className="w-full px-3 py-2 bg-cyber-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Domain / Category
            </label>
            <select
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full px-3 py-2 bg-cyber-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {DEFAULT_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 bg-cyber-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Task Description / Scenario
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide scenario, narrative, and objectives..."
            className="w-full px-3 py-2 bg-cyber-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Progressive Hint (Optional)
          </label>
          <textarea
            rows={2}
            value={formData.hint}
            onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
            placeholder="Guidance or clue for players stuck on this stage..."
            className="w-full px-3 py-2 bg-cyber-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>
              Plaintext Flag {initialData && <span className="text-slate-500 font-normal">(Leave blank to keep existing)</span>}
            </span>
            <span className="text-cyan-400 font-mono text-[10px]">Auto-hashed with BCrypt</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Key className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={formData.flag}
              onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
              placeholder={initialData ? 'Enter new flag to update, or leave empty' : 'CTF{your_secret_flag}'}
              required={!initialData}
              className="w-full pl-9 pr-3 py-2 bg-cyber-950 border border-slate-700 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="activeCheckbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-cyber-950"
          />
          <label htmlFor="activeCheckbox" className="text-xs text-slate-300 select-none">
            Active (visible to players on challenge board)
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-xl shadow-lg shadow-cyan-600/20 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{initialData ? 'Update Challenge' : 'Create Challenge'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
