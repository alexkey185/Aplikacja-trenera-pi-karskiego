'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, zodToFieldErrors } from '@/lib/schemas';
import { toast } from 'sonner';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({}); // <-- ZMIENIONY TYP
  const router = useRouter();
  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(zodToFieldErrors(parsed.error));
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      toast.error('Błąd logowania', { description: 'Nieprawidłowy e-mail lub hasło.' });
      setIsLoading(false);
      return;
    }

    toast.success('Zalogowano pomyślnie');
    router.push('/dashboard');
    router.refresh();
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error('Błąd logowania Google', { description: error.message });
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/60 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Zaloguj się</h1>
        <p className="text-sm text-white/50">Wróć do zarządzania drużyną</p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {isGoogleLoading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        <span>Kontynuuj z Google</span>
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-white/40 font-semibold">lub</span>
        </div>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            E-mail
          </label>
          <input
            name="email"
            type="email"
            placeholder="twoj@email.pl"
            className={`w-full bg-white/5 border rounded-xl px-3 py-2 text-white placeholder:text-white/30 outline-none transition-all ${
              errors.email ? 'border-red-400/50 focus:border-red-400' : 'border-white/15 focus:border-green-400/60'
            }`}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            Hasło
          </label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className={`w-full bg-white/5 border rounded-xl px-3 py-2 text-white placeholder:text-white/30 outline-none transition-all ${
              errors.password ? 'border-red-400/50 focus:border-red-400' : 'border-white/15 focus:border-green-400/60'
            }`}
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>

      <p className="text-center text-sm text-white/50 mt-6">
        Nie masz konta?{' '}
        <Link href="/sign-up" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
          Zarejestruj się
        </Link>
      </p>
    </div>
  );
}