'use client';

import { usunTrening } from './actions';

export function DeleteButton({ id }: { id: number }) {
  return (
    <form action={usunTrening}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm('Na pewno usunąć to wydarzenie?')) {
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