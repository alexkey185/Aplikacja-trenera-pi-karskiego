'use client';

import { usunZawodnika } from '../zawodnicy/[id]/edytuj/actions';
import { Trash2 } from 'lucide-react';

export function UsunButton({ id }: { id: number }) {
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
        className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-400/30 hover:border-red-400/60 flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
        title="Usuń zawodnika"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}