import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function AppNotFound() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/60 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 shadow-2xl shadow-slate-500/30 mb-5">
          <Search className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>

        <div className="text-5xl font-black text-white/20 mb-2">404</div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
          Nie znaleziono strony
        </h1>
        <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-md mx-auto">
          Ta strona nie istnieje albo została przeniesiona.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do pulpitu
        </Link>
      </div>
    </div>
  );
}