// components/DeleteEventButtonLazy.tsx
'use client';

import dynamic from 'next/dynamic';
import { Trash2 } from 'lucide-react';

export const DeleteEventButtonLazy = dynamic(
  () =>
    import('@/app/(app)/kalendarz/DeleteEventButton').then(
      (m) => m.DeleteEventButton
    ),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20"
        title="Usun wydarzenie"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    ),
  }
);