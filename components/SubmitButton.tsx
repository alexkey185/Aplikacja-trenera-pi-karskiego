'use client';

import { Loader2, type LucideIcon } from 'lucide-react';

type SubmitButtonProps = {
  /** Ikona po lewej (ukryta gdy loading) */
  icon: LucideIcon;
  /** Tekst przycisku w stanie spoczynku (np. "Zaloguj się") */
  label: string;
  /** Tekst podczas ładowania (np. "Logowanie...") */
  loadingLabel: string;
  /** Czy trwa operacja */
  loading: boolean;
  /** Opcjonalny dodatkowy className */
  className?: string;
};

export function SubmitButton({
  icon: Icon,
  label,
  loadingLabel,
  loading,
  className = '',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none mt-2 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
}