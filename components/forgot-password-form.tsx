'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Send, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AuthField } from '@/components/AuthField';
import { SubmitButton } from '@/components/SubmitButton';
import { forgotPasswordSchema, zodToFieldErrors } from '@/lib/schemas';

function translateResetError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Zbyt wiele prób. Spróbuj ponownie za chwilę';
  }
  if (lower.includes('invalid email')) {
    return 'Adres email jest nieprawidłowy';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Błąd połączenia. Sprawdź internet';
  }
  return message;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldErrors(zodToFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? translateResetError(err.message) : 'Wystąpił błąd';
      setError(message);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-green-400/30 rounded-3xl p-6 shadow-2xl shadow-black/60 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 shadow-2xl shadow-green-500/30 mb-4">
          <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
          Sprawdź maila
        </h2>
        <p className="text-sm text-white/60 leading-relaxed mb-6">
          Jeśli konto z adresem <strong className="text-white">{email}</strong> istnieje,
          wysłaliśmy na nie link do zresetowania hasła.
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

  return (
    <div className="w-full">
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/60">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 shadow-2xl shadow-green-500/30 mb-4">
            <Mail className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            Zapomniałeś hasła?
          </h1>
          <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
            Wpisz email, na który założone jest konto — wyślemy link do zresetowania hasła.
          </p>
        </div>

        <form onSubmit={handleForgotPassword} noValidate className="space-y-4">
          <AuthField
            icon={Mail}
            label="Email"
            name="email"
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (fieldErrors.email) setFieldErrors({});
            }}
            placeholder="trener@example.com"
            error={fieldErrors.email}
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
            icon={Send}
            label="Wyślij link"
            loadingLabel="Wysyłanie..."
            loading={isLoading}
          />
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">
            Pamiętasz hasło?{' '}
            <Link
              href="/auth/login"
              className="text-green-400 hover:text-green-300 font-semibold transition-colors"
            >
              Wróć do logowania
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