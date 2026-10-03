'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal app error:', error);
  }, [error]);

  return (
    <html lang="pl">
      <body className="bg-slate-950 text-white">
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-red-400/30 rounded-3xl p-6 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 via-red-500 to-red-700 shadow-2xl shadow-red-500/30 mb-4">
              <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Aplikacja nie odpowiada</h1>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Wystąpił krytyczny błąd ładowania. Odśwież stronę, żeby spróbować ponownie.
            </p>
            {error.digest && (
              <p className="text-[10px] text-white/30 font-mono mb-4 break-all">
                Kod błędu: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all"
            >
              <RotateCw className="w-4 h-4" />
              Odśwież
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}