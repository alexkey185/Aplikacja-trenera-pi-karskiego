'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push('/dashboard')
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Wystąpił błąd');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-3xl p-6 shadow-2xl shadow-green-900/10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Zaloguj się</h2>
          <p className="text-sm text-slate-500 mt-1">
            Wpisz email i hasło, żeby wejść do aplikacji
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider"
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
              className="w-full bg-white border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                <Lock className="w-3.5 h-3.5" />
                Hasło
              </label>
              <a
                href="/auth/forgot-password"
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Zapomniałeś?
              </a>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl px-4 py-3 text-slate-900 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 mt-2"
          >
            <LogIn className="w-5 h-5" />
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}