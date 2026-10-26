'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type Props = {
  id: number | string;
  onDelete: (id: number | string) => Promise<{ error?: string; success?: boolean } | void>;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  buttonLabel?: string;
  variant?: 'icon' | 'full';
  redirectTo?: string;
  successMessage?: string;
};

export function DeleteConfirmButton({
  id,
  onDelete,
  title,
  description,
  confirmLabel = 'Usuń',
  buttonLabel = 'Usuń',
  variant = 'full',
  redirectTo,
  successMessage = 'Usunięto',
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    setOpen(false);
    startTransition(async () => {
      try {
        const result = await onDelete(id);
        if (result && 'error' in result && result.error) {
          toast.error('Nie udało się usunąć', { description: result.error });
          return;
        }
        toast.success(successMessage);
        if (redirectTo) {
          router.push(redirectTo);
        }
        router.refresh();
      } catch (err) {
        toast.error('Nie udało się usunąć', {
          description: err instanceof Error ? err.message : 'Nieznany błąd',
        });
      }
    });
  };

  const buttonClass =
    variant === 'icon'
      ? 'w-9 h-9 rounded-xl bg-red-500/5 hover:bg-red-500/20 border border-red-400/20 hover:border-red-400/50 flex items-center justify-center text-red-400/60 hover:text-red-300 transition-all disabled:opacity-50'
      : 'flex items-center justify-center gap-2 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-0.5 border border-white/20 disabled:opacity-70 disabled:cursor-wait';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className={buttonClass}
        title={buttonLabel}
        aria-label={buttonLabel}
      >
        <Trash2 className={variant === 'icon' ? 'w-4 h-4' : 'w-4 h-4'} />
        {variant === 'full' && <span>{isPending ? 'Usuwanie...' : buttonLabel}</span>}
      </button>

      <ConfirmDialog
        open={open}
        title={title}
        variant="danger"
        confirmLabel={isPending ? 'Usuwanie...' : confirmLabel}
        cancelLabel="Anuluj"
        loading={isPending}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
        message={description}
      />
    </>
  );
}