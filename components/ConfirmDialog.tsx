'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, LogOut, Loader2 } from 'lucide-react';

type Variant = 'default' | 'danger' | 'warning' | 'info';

type Props = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  /** Opcjonalna własna ikona (nadpisuje domyślną dla wariantu) */
  icon?: React.ReactNode;
  /** Stan ładowania — wyświetla spinner, blokuje przyciski */
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

const VARIANT_STYLES: Record<
  Variant,
  {
    Icon: typeof AlertTriangle;
    iconBg: string;
    iconColor: string;
    button: string;
    buttonShadow: string;
  }
> = {
  default: {
    Icon: Info,
    iconBg: 'bg-green-500/15 border border-green-400/40',
    iconColor: 'text-green-400',
    button: 'from-green-500 to-green-600 hover:from-green-400 hover:to-green-500',
    buttonShadow: 'shadow-green-500/30',
  },
  danger: {
    Icon: AlertTriangle,
    iconBg: 'bg-red-500/15 border border-red-400/40',
    iconColor: 'text-red-400',
    button: 'from-red-500 to-red-700 hover:from-red-400 hover:to-red-600',
    buttonShadow: 'shadow-red-500/30',
  },
  warning: {
    Icon: AlertTriangle,
    iconBg: 'bg-orange-500/15 border border-orange-400/40',
    iconColor: 'text-orange-400',
    button: 'from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600',
    buttonShadow: 'shadow-orange-500/30',
  },
  info: {
    Icon: LogOut,
    iconBg: 'bg-blue-500/15 border border-blue-400/40',
    iconColor: 'text-blue-400',
    button: 'from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600',
    buttonShadow: 'shadow-blue-500/30',
  },
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  variant = 'default',
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const [mounted, setMounted] = useState(false);

  // Refy trzymają aktualne wartości bez zmiany rozmiaru tablicy zależności
  const loadingRef = useRef(loading);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  // Portal dostępny po montażu
  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC zamyka + blokada scrolla tła.
  // Uwaga: tablica zależności ma STAŁY rozmiar [open] — dzięki refom nie musimy
  // dorzucać `loading` i `onCancel`, co powodowało błąd w HMR.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loadingRef.current) {
        onCancelRef.current();
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const style = VARIANT_STYLES[variant];
  const Icon = style.Icon;

  // ═══════════════════════════════════════════════════
  // AutoFocus: przy danger → Cancel, reszta → Confirm.
  //
  // Dlaczego: przy usuwaniu (Enter potwierdza) user może
  // przypadkowo wcisnąć Enter po wpisaniu czegoś i skasować
  // dane. Bezpieczniej żeby focus był na Cancel.
  // ═══════════════════════════════════════════════════
  const focusOnCancel = variant === 'danger';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => !loading && onCancel()}
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
        {/* Ikona (custom lub z wariantu) */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${style.iconBg}`}
        >
          {icon ?? (
            <Icon className={`w-6 h-6 ${style.iconColor}`} strokeWidth={2.5} />
          )}
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
            disabled={loading}
            autoFocus={focusOnCancel && !loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            autoFocus={!focusOnCancel && !loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br ${style.button} text-white font-semibold text-sm transition-all active:scale-95 shadow-lg ${style.buttonShadow} disabled:opacity-70 disabled:cursor-wait disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}