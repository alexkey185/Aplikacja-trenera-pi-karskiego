'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Lock, Save, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthField } from '@/components/AuthField';
import { SubmitButton } from '@/components/SubmitButton';
import { updatePasswordSchema, zodToFieldErrors } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/errors';

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    repeatPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = updatePasswordSchema.safeParse({ password, repeatPassword });
    if (!result.success) {
      setFieldErrors(zodToFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      // ═══════════════════════════════════════════════════
      // Sukces: pełne wylogowanie + hard redirect na login.
      //
      // Dlaczego nie signOut({ scope: 'others' }):
      //   - scope: 'others' wylogowuje tylko INNE sesje, bieżąca
      //     zostaje aktywna. User ląduje na /auth/login, ale
      //     login/page.tsx widzi zalogowanego usera i robi
      //     redirect('/dashboard') - wygląda jakby wylogowanie
      //     nie zadziałało.
      //
      // Dlaczego window.location.href zamiast router.push:
      //   - hard reload czyści cały stan klienta (loading, cache SW)
      //   - standard dla operacji logout
      // ═══════════════════════════════════════════════════
      await supabase.auth.signOut();
      window.location.href = '/auth/login';
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/60">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-700 shadow-2xl shadow-green-500/30 mb-4">
            <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            Nowe hasło
          </h1>
          <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
            Wpisz nowe hasło do swojego konta. Po zapisie zaloguj się ponownie.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} noValidate className="space-y-4">
          <AuthField
            icon={Lock}
            label="Nowe hasło"
            name="password"
            id="update-password"
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
            label="Powtórz nowe hasło"
            name="repeat-password"
            id="update-repeat-password"
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
            icon={Save}
            label="Zmień hasło"
            loadingLabel="Zapisywanie..."
            loading={isLoading}
          />
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">
            Nie chcesz zmieniać?{' '}
            <Link
              href="/profil"
              className="text-green-400 hover:text-green-300 font-semibold transition-colors"
            >
              Wróć do profilu
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