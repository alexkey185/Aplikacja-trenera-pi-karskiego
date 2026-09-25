'use client';

import { usunZawodnika } from './actions';
import { Trash2 } from 'lucide-react';

export function DeleteButton({ id }: { id: number }) {
  return (
    <form action={usunZawodnika}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm('Na pewno usunąć tego zawodnika? Tego nie można cofnąć.')) {
            e.preventDefault();
          }
        }}
        className="group flex items-center justify-center gap-2 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-0.5"
      >
        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Usuń
      </button>
    </form>
  );
}