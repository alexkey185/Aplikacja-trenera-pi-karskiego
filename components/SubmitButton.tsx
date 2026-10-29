'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

type SubmitButtonProps = {
  /** Etykieta + opcjonalna ikona jako JSX (np. <Save /> Etykieta) */
  children: ReactNode;
  loadingLabel?: string;
  /**
   * Opcjonalne. Używane w formularzach klienckich (np. logowanie, rejestracja),
   * gdzie stan ładowania jest zarządzane ręcznie przez useState.
   * W Server Actions (np. dodawanie zawodnika) można pominąć — komponent
   * sam wykryje pending przez useFormStatus.
   */
  loading?: boolean;
  className?: string;
};

export function SubmitButton({
  children,
  loadingLabel = 'Zapisywanie...',
  loading: loadingProp,
  className = '',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const isPending = loadingProp !== undefined ? loadingProp : pending;

  return (
    <button
      type="submit"
      disabled={isPending}
      className={`w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 text-sm md:text-base ${className}`}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {children}
        </span>
      )}
    </button>
  );
}