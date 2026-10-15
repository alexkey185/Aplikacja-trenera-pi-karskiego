'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  AlertCircle,
  Bug,
  Lightbulb,
  HelpCircle,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

const TYPY = [
  { value: 'blad', label: 'Zgłaszam błąd', icon: Bug, color: 'text-red-400' },
  { value: 'pomysl', label: 'Pomysł na funkcję', icon: Lightbulb, color: 'text-yellow-400' },
  { value: 'pytanie', label: 'Mam pytanie', icon: HelpCircle, color: 'text-blue-400' },
  { value: 'inne', label: 'Inne', icon: MessageSquare, color: 'text-white/60' },
] as const;

export function PomocForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const [typ, setTyp] = useState<'blad' | 'pomysl' | 'pytanie' | 'inne'>('blad');
  const [email, setEmail] = useState(defaultEmail);
  const [temat, setTemat] = useState('');
  const [opis, setOpis] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (temat.trim().length < 3) {
      setError('Temat musi mieć minimum 3 znaki');
      setIsLoading(false);
      return;
    }
    if (opis.trim().length < 10) {
      setError('Opis musi mieć minimum 10 znaków');
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('zgloszenia').insert({
      user_id: user?.id ?? null,
      user_email: email,
      typ,
      temat: temat.trim(),
      opis: opis.trim(),
      page_url: typeof window !== 'undefined' ? window.location.href : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-green-400/30 rounded-3xl p-6 animate-fadeIn shadow-2xl shadow-black/60 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 shadow-2xl shadow-green-500/30 mb-4">
          <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
          Dziękujemy!
        </h2>
        <p className="text-sm text-white/60 mb-6 leading-relaxed">
          Twoje zgłoszenie zostało zapisane. Odpowiemy najszybciej jak to możliwe.
        </p>
        <button
          type="button"
          onClick={() => router.push('/profil')}
          className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50"
        >
          Powrót do profilu
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60"
    >
      <div>
        <label className="flex items-center gap-2 text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-3">
          <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
          Rodzaj zgłoszenia
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TYPY.map((t) => {
            const Icon = t.icon;
            const aktywny = typ === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTyp(t.value)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  aktywny
                    ? 'bg-blue-500/15 border-blue-400/50 shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/25'
                }`}
              >
                <Icon className={`w-4 h-4 ${aktywny ? t.color : 'text-white/40'} flex-shrink-0`} />
                <span className={`text-xs font-semibold ${aktywny ? 'text-white' : 'text-white/60'}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-2">
          Twój email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.pl"
          className="w-full bg-white/5 border border-white/15 focus:border-blue-400/60 focus:bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-2">
          Temat
        </label>
        <input
          type="text"
          required
          value={temat}
          onChange={(e) => setTemat(e.target.value)}
          placeholder="Krótki opis problemu"
          maxLength={100}
          className="w-full bg-white/5 border border-white/15 focus:border-blue-400/60 focus:bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-2">
          Opis szczegółowy
        </label>
        <textarea
          required
          value={opis}
          onChange={(e) => setOpis(e.target.value)}
          rows={6}
          maxLength={2000}
          placeholder="Opisz dokładnie co się stało. Jeśli to błąd - napisz co robiłeś, gdy wystąpił."
          className="w-full bg-white/5 border border-white/15 focus:border-blue-400/60 focus:bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-all leading-relaxed"
        />
        <div className="text-[10px] text-white/30 text-right mt-1">
          {opis.length} / 2000 znaków
        </div>
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-400/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-blue-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Wysyłanie...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Wyślij zgłoszenie
          </>
        )}
      </button>

      <p className="text-[10px] text-white/40 text-center leading-relaxed">
        Zgłoszenie trafia bezpośrednio do twórcy aplikacji. Odpowiemy na podany email.
      </p>
    </form>
  );
}