'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// Polskie komunikaty błędów Supabase (mapowanie error.code)
// ═══════════════════════════════════════════════════════════
function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Nieprawidłowy email lub hasło';
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Najpierw potwierdź swój email (sprawdź skrzynkę)';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Zbyt wiele prób logowania. Spróbuj ponownie za chwilę';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Błąd połączenia. Sprawdź internet';
  }
  return message;
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Wpisz swój adres e-mail';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Adres e-mail jest nieprawidłowy';
    }

    if (!password) {
      errors.password = 'Wpisz swoje hasło';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    const supabase = createClient();
    setIsLoading(true);

    // ═══════════════════════════════════════════════════════
    // BEZPIECZNIK: jeśli nawigacja po sukcesie nie zadziała
    // w 10 sekund, odblokuj przycisk (użytkownik nie zostanie
    // „uwięziony" w stanie loading).
    // ═══════════════════════════════════════════════════════
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
      setError('Przekierowanie trwa zbyt długo. Spróbuj odświeżyć stronę.');
    }, 10000);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // ═══════════════════════════════════════════════════════
      // SUKCES: NIE czyścimy safetyTimer i NIE wywołujemy
      // setIsLoading(false) — komponent odmontuje się po
      // przekierowaniu, a przycisk pozostanie zablokowany do
      // końca (zapobiega podwójnemu klikowi w trakcie nawigacji).
      // ═══════════════════════════════════════════════════════
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      // BŁĄD: czyścimy bezpiecznik, pokazujemy komunikat, odblokowujemy przycisk
      clearTimeout(safetyTimer);
      const message = err instanceof Error ? translateAuthError(err.message) : 'Wystąpił błąd';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/60">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 shadow-2xl shadow-green-500/30 mb-4">
            <LogIn className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            Zaloguj się
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Wpisz email i hasło, żeby wejść do aplikacji
          </p>
        </div>

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="flex items-center gap-2 text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Mail className="w-3.5 h-3.5 text-green-400" />
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((fe) => ({ ...fe, email: undefined }));
                }
              }}
              placeholder="trener@example.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all ${
                fieldErrors.email
                  ? 'border-red-400/70 focus:border-red-400 bg-red-500/5'
                  : 'border-white/15 focus:border-green-400/60 focus:bg-white/10'
              }`}
            />
            {fieldErrors.email && (
              <div id="login-email-error" role="alert" className="flex items-center gap-1.5 mt-2 text-[11px] text-red-300 animate-fadeIn">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.email}</span>
              </div>
            )}
          </div>

          {/* Hasło */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="login-password" className="flex items-center gap-2 text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-green-400" />
                Hasło
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[10px] text-green-400 hover:text-green-300 font-semibold transition-colors"
              >
                Zapomniałeś?
              </Link>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((fe) => ({ ...fe, password: undefined }));
                }
              }}
              placeholder="Wpisz hasło"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all ${
                fieldErrors.password
                  ? 'border-red-400/70 focus:border-red-400 bg-red-500/5'
                  : 'border-white/15 focus:border-green-400/60 focus:bg-white/10'
              }`}
            />
            {fieldErrors.password && (
              <div id="login-password-error" role="alert" className="flex items-center gap-1.5 mt-2 text-[11px] text-red-300 animate-fadeIn">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.password}</span>
              </div>
            )}
          </div>

          {/* Global error (z Supabase) */}
          {error && (
            <div role="alert" className="bg-red-500/15 border border-red-400/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logowanie...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Zaloguj się
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">
            Nie masz konta?{' '}
            <Link
              href="/auth/sign-up"
              className="text-green-400 hover:text-green-300 font-semibold transition-colors"
            >
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Powrót do strony głównej
        </Link>
      </div>
    </div>
  );
}