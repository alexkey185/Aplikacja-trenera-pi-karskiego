import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, LogIn } from 'lucide-react';

export default async function StartScreen() {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const zalogowany = !!user;

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 via-green-100/60 to-white">
      {/* GRAFIKA — pełna szerokość */}
      <div className="relative w-full flex-shrink-0">
        <Image
          src="/talent-hero.png"
          alt="Talent"
          width={1200}
          height={800}
          priority
          className="w-full h-auto"
        />
        {/* Delikatny gradient od dołu — płynne przejście do treści */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-50 via-green-50/70 to-transparent" />
      </div>

      {/* TREŚĆ — poniżej grafiki */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pb-10 -mt-10">
        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-blue-950 mb-2 animate-fadeIn">
          talent
          <span className="text-green-500">.</span>
        </h1>

        <p className="text-slate-600 text-center text-sm mb-8 animate-fadeIn">
          Aplikacja trenera piłkarskiego
        </p>

        <div className="w-full max-w-xs space-y-3 animate-fadeIn">
          {zalogowany ? (
            <Link
              href="/kadra"
              className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-green-500/50 hover:-translate-y-1"
            >
              Wejdź do aplikacji
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-green-500/50 hover:-translate-y-1"
            >
              <LogIn className="w-5 h-5" />
              Zaloguj się
            </Link>
          )}

          <p className="text-center text-xs text-slate-500 pt-2">
            Wersja 1.0 · Twój zespół, Twoje zasady
          </p>
        </div>
      </div>
    </main>
  );
}