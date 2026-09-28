'use client';

import { useState, useRef } from 'react';
import { usunTrening } from './[id]/edytuj/actions';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function UsunButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={usunTrening} className="hidden">
        <input type="hidden" name="id" value={id} />
      </form>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-400/30 flex items-center justify-center text-red-400 transition-all"
        title="Usuń wydarzenie"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmDialog
        open={open}
        title="Usunąć to wydarzenie?"
        message={
          <>
            Usuną się też wszystkie wpisy obecności dla tego treningu.
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