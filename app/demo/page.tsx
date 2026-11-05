'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function DemoPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const loginDemo = async () => {
      // 1. Zapisujemy odwiedziny w tle (nie czekamy na odpowiedź, żeby nie spowalniać)
      supabase.from('demo_visits').insert({
        user_agent: navigator.userAgent,
        referer: document.referrer || 'wpisany_z_reki',
      }).then();

      // 2. Logowanie na konto demo
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@test.pl', // Upewnij się, że to Twoje konto testowe
        password: 'Testowe123!',
      });

      if (error) {
        setError(error.message);
        return;
      }

      // 3. Twarde przekierowanie
      window.location.href = '/dashboard';
    };

    loginDemo();
  }, []);

  if (error) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-[#0a0e1a] text-white p-4">
        <div className="max-w-md w-full text-center bg-slate-900/80 border border-red-400/30 rounded-3xl p-6 shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2 text-red-400">Błąd logowania demo</h1>
          <p className="text-sm text-white/70 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-[#0a0e1a] text-white">
      <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
      <h1 className="text-xl font-bold">Przygotowujemy Twoje demo...</h1>
      <p className="text-white/50 text-sm mt-2">Za chwilę przeniesiemy Cię do aplikacji.</p>
    </div>
  );
}