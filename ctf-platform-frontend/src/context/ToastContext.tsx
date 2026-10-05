import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

/* ────────────── types ────────────── */
type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant, durationMs?: number) => void;
  removeToast: (id: string) => void;
}

/* ────────────── context ────────────── */
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

/* ────────────── styling maps ────────────── */
const variantStyles: Record<ToastVariant, string> = {
  success:
    'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-900/20',
  error:
    'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-lg shadow-rose-900/20',
  info:
    'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-900/20',
  warning:
    'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-900/20',
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />,
  error: <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />,
  info: <Info className="w-4.5 h-4.5 text-cyan-400 shrink-0" />,
  warning: <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0" />,
};

/* ────────────── progress bar colors ────────────── */
const progressColors: Record<ToastVariant, string> = {
  success: 'bg-emerald-400',
  error: 'bg-rose-400',
  info: 'bg-cyan-400',
  warning: 'bg-amber-400',
};

/* ────────────── individual toast ────────────── */
const ToastItem: React.FC<{
  toast: Toast;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const [exiting, setExiting] = React.useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [onDismiss, toast.id]);

  React.useEffect(() => {
    const timer = setTimeout(dismiss, toast.durationMs);
    return () => clearTimeout(timer);
  }, [dismiss, toast.durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden flex items-start gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-lg text-sm font-medium transition-all duration-200 ${
        variantStyles[toast.variant]
      } ${
        exiting
          ? 'opacity-0 translate-x-8 scale-95'
          : 'opacity-100 translate-x-0 scale-100 animate-in fade-in slide-in-from-right-4 duration-300'
      }`}
    >
      {variantIcons[toast.variant]}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={dismiss}
        className="shrink-0 p-0.5 rounded-md hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
      </button>

      {/* Auto-dismiss progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-[2px] ${progressColors[toast.variant]} rounded-full`}
        style={{
          animation: `toast-shrink ${toast.durationMs}ms linear forwards`,
        }}
      />
    </div>
  );
};

/* ────────────── provider ────────────── */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', durationMs = 4000) => {
      const id = `toast-${++idCounter.current}-${Date.now()}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, variant, durationMs }]); // keep max 5
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      {toasts.length > 0 && (
        <div
          aria-label="Notifications"
          className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-auto"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
