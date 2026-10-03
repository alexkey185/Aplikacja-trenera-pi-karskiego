'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // W produkcji → tu wyląduje Sentry
    console.error('App error:', error);
  }, [error]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-10 bg-slate-950/70 md:backdrop-blur-sm" />

      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-md border border-red-400/30 rounded-3xl p-6 shadow-2xl shadow-black/60 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 via-red-500 to-red-700 shadow-2xl shadow-red-500/30 mb-4">
            <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>

          <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
            Coś poszło nie tak
          </h1>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            Wystąpił nieoczekiwany błąd. Możesz spróbować ponownie albo wrócić do
            pulpitu.
          </p>

          {error.digest && (
            <p className="text-[10px] text-white/30 font-mono mb-4 break-all">
              Kod błędu: {error.digest}
            </p>
          )}

          <div className="space-y-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50"
            >
              <RotateCw className="w-4 h-4" />
              Spróbuj ponownie
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-semibold py-3 rounded-2xl text-sm transition-all"
            >
              <Home className="w-4 h-4" />
              Wróć do pulpitu
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}