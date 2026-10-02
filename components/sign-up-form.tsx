'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, UserPlus, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { AuthField } from '@/components/AuthField';
import { SubmitButton } from '@/components/SubmitButton';
import { signUpSchema, zodToFieldErrors } from '@/lib/schemas';

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
    acceptedTerms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ═══ Walidacja przez wspólny schemat ═══
    const result = signUpSchema.safeParse({
      email,
      password,
      repeatPassword,
      acceptedTerms,
    });

    if (!result.success) {
      setFieldErrors(zodToFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setIsLoading(true);

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
          <AuthField
            icon={Mail}
            label="Email"
            name="email"
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (fieldErrors.email) setFieldErrors((fe) => ({ ...fe, email: undefined }));
            }}
            placeholder="trener@example.com"
            error={fieldErrors.email}
          />

          <AuthField
            icon={Lock}
            label="Hasło"
            name="password"
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (fieldErrors.password) setFieldErrors((fe) => ({ ...fe, password: undefined }));
            }}
            placeholder="Minimum 8 znaków"
            error={fieldErrors.password}
          />

          <AuthField
            icon={Lock}
            label="Powtórz hasło"
            name="repeat-password"
            id="signup-repeat-password"
            type="password"
            autoComplete="new-password"
            value={repeatPassword}
            onChange={(v) => {
              setRepeatPassword(v);
              if (fieldErrors.repeatPassword) setFieldErrors((fe) => ({ ...fe, repeatPassword: undefined }));
            }}
            placeholder="Powtórz hasło"
            error={fieldErrors.repeatPassword}
          />

          {/* Checkbox akceptacji */}
          <div className="pt-1">
            <div className="flex items-start gap-3">
              <label className="relative flex-shrink-0 mt-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (fieldErrors.acceptedTerms) {
                      setFieldErrors((fe) => ({ ...fe, acceptedTerms: undefined }));
                    }
                  }}
                  className="peer sr-only"
                  aria-invalid={!!fieldErrors.acceptedTerms}
                  aria-describedby={fieldErrors.acceptedTerms ? 'signup-terms-error' : undefined}
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    acceptedTerms
                      ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-lg shadow-green-500/40'
                      : fieldErrors.acceptedTerms
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
            {fieldErrors.acceptedTerms && (
              <div
                id="signup-terms-error"
                role="alert"
                className="flex items-center gap-1.5 mt-2 text-[11px] text-red-300 animate-fadeIn"
              >
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fieldErrors.acceptedTerms}</span>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="bg-red-500/15 border border-red-400/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <SubmitButton
            icon={UserPlus}
            label="Zarejestruj się"
            loadingLabel="Tworzenie konta..."
            loading={isLoading}
          />
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