'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const [mounted, setMounted] = useState(false);

  // Portal można tworzyć dopiero po montażu klienta
  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC zamyka + blokada scrolla tła
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  const isDanger = variant === 'danger';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm bg-slate-900 border border-white/15 rounded-2xl p-5 shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ikona */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            isDanger
              ? 'bg-red-500/15 border border-red-400/40'
              : 'bg-green-500/15 border border-green-400/40'
          }`}
        >
          <AlertTriangle
            className={`w-6 h-6 ${isDanger ? 'text-red-400' : 'text-green-400'}`}
            strokeWidth={2.5}
          />
        </div>

        {/* Tytuł */}
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>

        {/* Treść */}
        <div className="text-sm text-white/70 leading-relaxed mb-5">
          {message}
        </div>

        {/* Przyciski */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all text-white active:scale-95 ${
              isDanger
                ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/30'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}