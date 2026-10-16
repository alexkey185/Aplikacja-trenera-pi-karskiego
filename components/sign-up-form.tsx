'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, UserPlus, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { AuthField } from '@/components/AuthField';
import { SubmitButton } from '@/components/SubmitButton';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { signUpSchema, zodToFieldErrors } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/errors';

const STORAGE_KEY = 'talent_signup_draft';

type Draft = {
  email: string;
  password: string;
  repeatPassword: string;
  acceptedTerms: boolean;
};

const EMPTY_DRAFT: Draft = {
  email: '',
  password: '',
  repeatPassword: '',
  acceptedTerms: false,
};

function loadDraft(): Draft {
  if (typeof window === 'undefined') return EMPTY_DRAFT;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw);
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      password: typeof parsed.password === 'string' ? parsed.password : '',
      repeatPassword: typeof parsed.repeatPassword === 'string' ? parsed.repeatPassword : '',
      acceptedTerms: parsed.acceptedTerms === true,
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

function saveDraft(draft: Draft) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // sessionStorage zablokowane (tryb prywatny) â€” pomiĹ„
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // pomiĹ„
  }
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

  // Wczytaj draft przy montaĹĽu
  useEffect(() => {
    const draft = loadDraft();
    setEmail(draft.email);
    setPassword(draft.password);
    setRepeatPassword(draft.repeatPassword);
    setAcceptedTerms(draft.acceptedTerms);
  }, []);

  // Zapisz draft przy kaĹĽdej zmianie
  useEffect(() => {
    saveDraft({ email, password, repeatPassword, acceptedTerms });
  }, [email, password, repeatPassword, acceptedTerms]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      setError('Tworzenie konta trwa zbyt dlugo. Sprobuj odswiezyc strone.');
    }, 10000);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            accepted_terms: true,
            terms_version: '1.0',
            privacy_version: '1.0',
            accepted_at: new Date().toISOString(),
            signup_user_agent:
              typeof navigator !== 'undefined' ? navigator.userAgent : null,
          },
        },
      });

      if (error) throw error;

      clearTimeout(safetyTimer);
      clearDraft();
      router.push('/auth/sign-up-success');
      router.refresh();
    } catch (err) {
      clearTimeout(safetyTimer);
      setError(getErrorMessage(err));
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
            Zarejestruj sie
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Utworz nowe konto trenera
          </p>
        </div>

        <form onSubmit={handleSignUp} noValidate className="space-y-4">
          <GoogleSignInButton nextPath="/druzyny/nowa" />

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-slate-900/80 px-3 text-white/40 font-bold">
                lub
              </span>
            </div>
          </div>

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
            label="Haslo"
            name="password"
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (fieldErrors.password) setFieldErrors((fe) => ({ ...fe, password: undefined }));
            }}
            placeholder="Minimum 8 znakow"
            error={fieldErrors.password}
          />

          <AuthField
            icon={Lock}
            label="Powtorz haslo"
            name="repeat-password"
            id="signup-repeat-password"
            type="password"
            autoComplete="new-password"
            value={repeatPassword}
            onChange={(v) => {
              setRepeatPassword(v);
              if (fieldErrors.repeatPassword) setFieldErrors((fe) => ({ ...fe, repeatPassword: undefined }));
            }}
            placeholder="Powtorz haslo"
            error={fieldErrors.repeatPassword}
          />

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
                Akceptuje{' '}
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
                  Polityke prywatnosci
                </Link>
                , a takze oswiadczam, ze jako trener bede przetwarzal dane
                zawodnikow zgodnie z przepisami RODO.
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
            label="Zarejestruj sie"
            loadingLabel="Tworzenie konta..."
            loading={isLoading}
          />
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">
            Masz juz konto?{' '}
            <Link
              href="/auth/login"
              className="text-green-400 hover:text-green-300 font-semibold transition-colors"
            >
              Zaloguj sie
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
          Powrot do strony glownej
        </Link>
      </div>
    </div>
  );
}