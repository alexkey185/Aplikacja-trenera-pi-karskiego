'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthField } from '@/components/AuthField';
import { SubmitButton } from '@/components/SubmitButton';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { loginSchema, zodToFieldErrors } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/errors';

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

  const supabase = useMemo(() => createClient(), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(zodToFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setIsLoading(true);

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

      clearTimeout(safetyTimer);
      router.push('/dashboard');
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
          {/* Google OAuth */}
          <GoogleSignInButton nextPath="/dashboard" />

          {/* Separator */}
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
            id="login-email"
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
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (fieldErrors.password) setFieldErrors((fe) => ({ ...fe, password: undefined }));
            }}
            placeholder="Wpisz hasło"
            error={fieldErrors.password}
            labelRight={
              <Link
                href="/auth/forgot-password"
                className="text-[10px] text-green-400 hover:text-green-300 font-semibold transition-colors"
              >
                Zapomniałeś?
              </Link>
            }
          />

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
            icon={LogIn}
            label="Zaloguj się"
            loadingLabel="Logowanie..."
            loading={isLoading}
          />
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