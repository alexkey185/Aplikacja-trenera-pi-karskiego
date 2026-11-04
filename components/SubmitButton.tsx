'use client';

import { useFormStatus } from 'react-dom';
import { Loader2, type LucideIcon } from 'lucide-react';

type SubmitButtonProps = {
  icon?: LucideIcon;
  label?: string;
  loadingLabel?: string;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function SubmitButton({
  icon: Icon,
  label,
  loadingLabel = 'Zapisywanie...',
  loading: loadingProp,
  className = '',
  children,
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
      ) : children ? (
        children
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}