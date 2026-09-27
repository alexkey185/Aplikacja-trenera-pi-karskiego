'use client';

import { usunZawodnika } from '../zawodnicy/[id]/edytuj/actions';
import { Trash2 } from 'lucide-react';

export function UsunButton({
  id,
  compact = false,
}: {
  id: number;
  compact?: boolean;
}) {
  return (
    <form action={usunZawodnika}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (
            !confirm(
              'Na pewno usunąć tego zawodnika? Usuną się też wszystkie jego obecności. Tego nie można cofnąć.'
            )
          ) {
            e.preventDefault();
          }
        }}
        className={
          compact
            ? 'w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-400/30 flex items-center justify-center text-red-400 transition-all'
            : 'w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-400/30 flex items-center justify-center text-red-400 transition-all'
        }
        title="Usuń zawodnika"
      >
        <Trash2 className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
      </button>
    </form>
  );
}