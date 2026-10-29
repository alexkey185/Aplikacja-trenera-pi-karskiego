'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Send, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AuthField } from '@/components/AuthField';
import { SubmitButton } from '@/components/SubmitButton';
import { forgotPasswordSchema, zodToFieldErrors } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/errors';

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
      setError(getErrorMessage(err));
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
          SprawdĹş maila
        </h2>
        <p className="text-sm text-white/60 leading-relaxed mb-6">
          JeĹ›li konto z adresem <strong className="text-white">{email}</strong> istnieje,
          wysĹ‚aliĹ›my na nie link do zresetowania hasĹ‚a.
        </p>
        <p className="text-xs text-white/40 mb-6">
          Nie widzisz maila? SprawdĹş folder spam.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          WrĂłÄ‡ do logowania
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
            ZapomniaĹ‚eĹ› hasĹ‚a?
          </h1>
          <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
            Wpisz email, na ktĂłry zaĹ‚oĹĽone jest konto - wyĹ›lemy link do zresetowania hasĹ‚a.
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

          <SubmitButton loadingLabel="WysyĹ‚anie..." loading={isLoading}><Send className="w-4 h-4 flex-shrink-0" /><span>WyĹ›lij link</span></SubmitButton>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">
            PamiÄ™tasz hasĹ‚o?{' '}
            <Link
              href="/auth/login"
              className="text-green-400 hover:text-green-300 font-semibold transition-colors"
            >
              WrĂłÄ‡ do logowania
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
          PowrĂłt do strony gĹ‚Ăłwnej
        </Link>
      </div>
    </div>
  );
}