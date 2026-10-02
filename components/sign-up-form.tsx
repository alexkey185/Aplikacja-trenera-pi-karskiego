'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Mail,
  Lock,
  UserPlus,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Check,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// Polskie komunikaty błędów Supabase
// ═══════════════════════════════════════════════════════════
function translateSignUpError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Konto z tym emailem już istnieje. Zaloguj się';
  }
  if (lower.includes('password should be') || lower.includes('password is too short')) {
    return 'Hasło jest za krótkie (min. 8 znaków)';
  }
  if (lower.includes('invalid email') || lower.includes('email_address_invalid')) {
    return 'Adres email jest nieprawidłowy';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Zbyt wiele prób. Spróbuj ponownie za chwilę';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Błąd połączenia. Sprawdź internet';
  }
  return message;
}

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    repeatPassword?: string;
    terms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    const errors: {
      email?: string;
      password?: string;
      repeatPassword?: string;
      terms?: string;
    } = {};

    if (!email.trim()) {
      errors.email = 'Wpisz swój adres e-mail';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Adres e-mail jest nieprawidłowy';
    }

    if (!password) {
      errors.password = 'Wpisz hasło';
    } else if (password.length < 8) {
      // Zsynchronizowane z Supabase minimum (8 znaków)
      errors.password = 'Hasło musi mieć minimum 8 znaków';
    }

    if (!repeatPassword) {
      errors.repeatPassword = 'Powtórz hasło';
    } else if (password !== repeatPassword) {
      errors.repeatPassword = 'Hasła nie są identyczne';
    }

    if (!acceptedTerms) {
      errors.terms = 'Musisz zaakceptować Regulamin i Politykę prywatności';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    const supabase = createClient();
    setIsLoading(true);

    // Bezpiecznik: jeśli nawigacja nie zadziała w 10s — odblokuj
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
      setError('Tworzenie konta trwa zbyt długo. Spróbuj odświeżyć stronę.');
    }, 10000);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) throw error;

      // SUKCES: NIE czyścimy safetyTimer i NIE wywołujemy setIsLoading(false)
      router.push('/auth/sign-up-success');
      router.refresh();
    } catch (err) {
      clearTimeout(safetyTimer);
      const message = err instanceof Error ? translateSignUpError(err.message) : 'Wystąpił błąd';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/60">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 shadow-2xl shadow-green-500/30 mb-4">
            <UserPlus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            Zarejestruj się
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Utwórz nowe konto trenera
          </p>
        </div>

        <form onSubmit={handleSignUp} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="flex items-center gap-2 text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Mail className="w-3.5 h-3.5 text-green-400" />
              Email
            </label>
            <input
              id="signup-email"
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
              aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all ${
                fieldErrors.email
                  ? 'border-red-400/70 focus:border-red-400 bg-red-500/5'
                  : 'border-white/15 focus:border-green-400/60 focus:bg-white/10'
              }`}
            />
            {fieldErrors.email && (
              <div id="signup-email-error" role="alert" className="flex items-center gap-1.5 mt-2 text-[11px] text-red-300 animate-fadeIn">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.email}</span>
              </div>
            )}
          </div>

          {/* Hasło */}
          <div>
            <label htmlFor="signup-password" className="flex items-center gap-2 text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5 text-green-400" />
              Hasło
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((fe) => ({ ...fe, password: undefined }));
                }
              }}
              placeholder="Minimum 8 znaków"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all ${
                fieldErrors.password
                  ? 'border-red-400/70 focus:border-red-400 bg-red-500/5'
                  : 'border-white/15 focus:border-green-400/60 focus:bg-white/10'
              }`}
            />
            {fieldErrors.password && (
              <div id="signup-password-error" role="alert" className="flex items-center gap-1.5 mt-2 text-[11px] text-red-300 animate-fadeIn">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.password}</span>
              </div>
            )}
          </div>

          {/* Powtórz hasło */}
          <div>
            <label htmlFor="signup-repeat-password" className="flex items-center gap-2 text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5 text-green-400" />
              Powtórz hasło
            </label>
            <input
              id="signup-repeat-password"
              name="repeat-password"
              type="password"
              autoComplete="new-password"
              value={repeatPassword}
              onChange={(e) => {
                setRepeatPassword(e.target.value);
                if (fieldErrors.repeatPassword) {
                  setFieldErrors((fe) => ({ ...fe, repeatPassword: undefined }));
                }
              }}
              placeholder="Powtórz hasło"
              aria-invalid={!!fieldErrors.repeatPassword}
              aria-describedby={fieldErrors.repeatPassword ? 'signup-repeat-error' : undefined}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all ${
                fieldErrors.repeatPassword
                  ? 'border-red-400/70 focus:border-red-400 bg-red-500/5'
                  : 'border-white/15 focus:border-green-400/60 focus:bg-white/10'
              }`}
            />
            {fieldErrors.repeatPassword && (
              <div id="signup-repeat-error" role="alert" className="flex items-center gap-1.5 mt-2 text-[11px] text-red-300 animate-fadeIn">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.repeatPassword}</span>
              </div>
            )}
          </div>

          {/* Checkbox akceptacji */}
          <div className="pt-1">
            <div className="flex items-start gap-3">
              <label className="relative flex-shrink-0 mt-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (fieldErrors.terms) {
                      setFieldErrors((fe) => ({ ...fe, terms: undefined }));
                    }
                  }}
                  className="peer sr-only"
                  aria-invalid={!!fieldErrors.terms}
                  aria-describedby={fieldErrors.terms ? 'signup-terms-error' : undefined}
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    acceptedTerms
                      ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-lg shadow-green-500/40'
                      : fieldErrors.terms
                      ? 'bg-red-500/10 border-red-400/70'
                      : 'bg-white/5 border-white/25 hover:border-white/40'
                  }`}
                >
                  {acceptedTerms && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </div>
              </label>
              <span className="text-xs text-white/60 leading-relaxed">
                Akceptuję{' '}
                <Link
                  href="/regulamin"
                  className="text-green-400 hover:text-green-300 font-semibold underline underline-offset-2"
                >
                  Regulamin
                </Link>{' '}
                oraz{' '}
                <Link
                  href="/prywatnosc"
                  className="text-green-400 hover:text-green-300 font-semibold underline underline-offset-2"
                >
                  Politykę prywatności
                </Link>
                , a także oświadczam, że jako trener będę przetwarzał dane
                zawodników zgodnie z przepisami RODO.
              </span>
            </div>
            {fieldErrors.terms && (
              <div id="signup-terms-error" role="alert" className="flex items-center gap-1.5 mt-2 text-[11px] text-red-300 animate-fadeIn">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.terms}</span>
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
                Tworzenie konta...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Zarejestruj się
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">
            Masz już konto?{' '}
            <Link
              href="/auth/login"
              className="text-green-400 hover:text-green-300 font-semibold transition-colors"
            >
              Zaloguj się
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