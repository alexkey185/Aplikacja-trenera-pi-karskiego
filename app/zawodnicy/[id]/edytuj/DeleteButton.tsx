'use client';

import { usunZawodnika } from './actions';

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
        className="bg-red-700 hover:bg-red-800 transition-colors text-white font-semibold px-6 py-3 rounded-lg"
      >
        Usuń
      </button>
    </form>
  );
}