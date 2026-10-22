'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw, ArrowLeft } from 'lucide-react';

export default function KadraError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Kadra Error:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-slate-900/80 backdrop-blur-md border border-red-400/30 rounded-3xl p-8 shadow-2xl shadow-black/60 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 via-red-500 to-red-700 shadow-2xl shadow-red-500/30 mb-5">
          <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
          Nie udało się pobrać kadry
        </h1>
        <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-md mx-auto">
          Wystąpił problem z połączeniem z bazą danych lub serwer jest chwilowo niedostępny.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all"
          >
            <RotateCw className="w-4 h-4" />
            Spróbuj ponownie
          </button>
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-semibold py-3.5 rounded-2xl text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do pulpitu
          </Link>
        </div>
      </div>
    </div>
  );
}