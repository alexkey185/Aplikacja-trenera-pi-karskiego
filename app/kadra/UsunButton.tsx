'use client';

import { useState, useRef } from 'react';
import { usunZawodnika } from '../zawodnicy/[id]/edytuj/actions';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function UsunButton({
  id,
  compact = false,
}: {
  id: number;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={usunZawodnika} className="hidden">
        <input type="hidden" name="id" value={id} />
      </form>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? 'w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-400/30 flex items-center justify-center text-red-400 transition-all'
            : 'w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-400/30 flex items-center justify-center text-red-400 transition-all'
        }
        title="Usuń zawodnika"
      >
        <Trash2 className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
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
        onConfirm={() => {
          formRef.current?.requestSubmit();
          setOpen(false);
        }}
      />
    </>
  );
}