'use client';

import { useState, useRef } from 'react';
import { usunZawodnika } from './actions';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function DeleteButton({ id }: { id: number }) {
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
        className="group flex items-center justify-center gap-2 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-0.5 border border-white/20"
      >
        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Usuń
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