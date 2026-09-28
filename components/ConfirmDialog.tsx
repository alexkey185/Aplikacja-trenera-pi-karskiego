'use client';

import { useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

type Variant = 'danger' | 'warning' | 'primary';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  variant = 'primary',
  icon,
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const iconBg =
    variant === 'danger'
      ? 'from-red-500/20 to-red-900/10 border-red-400/30'
      : variant === 'warning'
      ? 'from-yellow-500/20 to-yellow-900/10 border-yellow-400/30'
      : 'from-green-500/20 to-green-900/10 border-green-400/30';

  const iconGlow =
    variant === 'danger'
      ? 'from-red-500 to-red-900'
      : variant === 'warning'
      ? 'from-yellow-500 to-yellow-900'
      : 'from-green-500 to-green-900';

  const iconColor =
    variant === 'danger'
      ? 'text-red-400'
      : variant === 'warning'
      ? 'text-yellow-400'
      : 'text-green-400';

  const confirmBtn =
    variant === 'danger'
      ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-900/40 hover:shadow-xl hover:shadow-red-900/50'
      : variant === 'warning'
      ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-lg shadow-yellow-900/40'
      : 'bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-900/40 hover:shadow-xl hover:shadow-green-900/50';

  const defaultIcon =
    variant === 'danger' ? (
      <Trash2 className="w-7 h-7" />
    ) : (
      <AlertTriangle className="w-7 h-7" />
    );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-slate-800/95 to-slate-900/98 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/70 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 relative bg-gradient-to-br border ${iconBg}`}
        >
          <div
            className={`absolute inset-0 rounded-2xl blur-xl opacity-60 bg-gradient-to-br ${iconGlow}`}
          />
          <div className={`relative ${iconColor}`}>
            {icon || defaultIcon}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white text-center mb-2">
          {title}
        </h3>
        <div className="text-sm text-white/60 text-center leading-relaxed mb-6 px-2">
          {message}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 font-semibold text-sm hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${confirmBtn}`}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}