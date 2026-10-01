'use client';

import { useState, useTransition } from 'react';
import { usunZawodnika } from './actions';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function DeleteButton({
  id,
  compact = false,
}: {
  id: number;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setOpen(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('id', String(id));
      await usunZawodnika(fd);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        title="Usuń zawodnika"
        aria-label="Usuń zawodnika"
        className={
          compact
            ? 'w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/25 backdrop-blur-md border border-red-400/30 hover:border-red-400/60 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors flex-shrink-0 disabled:opacity-70 disabled:cursor-wait'
            : 'group flex items-center justify-center gap-2 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-0.5 border border-white/20 disabled:opacity-70 disabled:cursor-wait'
        }
      >
        <Trash2
          className={
            compact
              ? 'w-4 h-4'
              : 'w-4 h-4 group-hover:scale-110 transition-transform'
          }
        />
        {!compact && (isPending ? 'Usuwanie...' : 'Usuń')}
      </button>

      <ConfirmDialog
        open={open}
        title="Usunąć zawodnika?"
        message={
          <>
            Zawodnik zostanie usunięty razem z całą historią obecności.
            <br />
            <br />
            <span style={{ color: '#f87171' }}>Tej operacji nie można cofnąć.</span>
          </>
        }
        confirmLabel="Usuń"
        variant="danger"
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}