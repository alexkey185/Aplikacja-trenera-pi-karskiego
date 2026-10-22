'use client';

import { useFormStatus } from 'react-dom';
import { Loader2, type LucideIcon } from 'lucide-react';

type SubmitButtonProps = {
  icon: LucideIcon;
  label: string;
  loadingLabel?: string;
  className?: string;
};

export function SubmitButton({
  icon: Icon,
  label,
  loadingLabel = 'Zapisywanie...',
  className = '',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 text-sm md:text-base ${className}`}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}