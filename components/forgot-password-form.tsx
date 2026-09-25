'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Send, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Wystąpił błąd');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl shadow-black/40">
        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-400/40 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Sprawdź skrzynkę
            </h2>
            <p className="text-sm text-white/70 mb-6">
              Wysłaliśmy link do resetu hasła na <br />
              <strong className="text-white">{email}</strong>
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Powrót do logowania
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Reset hasła</h2>
              <p className="text-sm text-white/70 mt-1">
                Podaj email, a wyślemy Ci link do zmiany hasła
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-white/80 uppercase tracking-wider"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 mt-2"
              >
                <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {isLoading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Powrót do logowania
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}