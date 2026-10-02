import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function SignUpSuccessPage() {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-green-400/30 rounded-3xl p-6 shadow-2xl shadow-black/60 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 shadow-2xl shadow-green-500/30 mb-4">
        <Mail className="w-7 h-7 text-white" strokeWidth={2.5} />
      </div>
      <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
        Dziękujemy!
      </h1>
      <p className="text-sm text-white/60 leading-relaxed mb-6">
        Konto zostało utworzone. Sprawdź skrzynkę e-mail i kliknij link
        potwierdzający, żeby aktywować konto.
      </p>
      <p className="text-xs text-white/40 mb-6">
        Nie widzisz maila? Sprawdź folder spam.
      </p>
      <Link
        href="/auth/login"
        className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Wróć do logowania
      </Link>
    </div>
  );
}