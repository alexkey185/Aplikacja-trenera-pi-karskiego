import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { translateUrlError } from '@/lib/errors';

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const raw = params.error ?? null;
  const message = translateUrlError(raw);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-red-400/30 rounded-3xl p-6 shadow-2xl shadow-black/60 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 via-red-500 to-red-700 shadow-2xl shadow-red-500/30 mb-4">
        <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
      </div>

      <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
        Wystąpił problem
      </h1>
      <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs mx-auto">
        {message}
      </p>

      {raw && (
        <p className="text-[10px] text-white/30 font-mono mb-6 break-all">
          Kod: {raw.length > 80 ? raw.slice(0, 80) + '…' : raw}
        </p>
      )}

      <div className="space-y-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do logowania
        </Link>
        <Link
          href="/profil/pomoc"
          className="inline-flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-semibold py-3 rounded-2xl text-xs transition-all"
        >
          Zgłoś problem
        </Link>
      </div>
    </div>
  );
}