import Link from 'next/link';
import Image from 'next/image';

import { createClient } from '@/lib/supabase/server';
import { LogIn, ArrowRight } from 'lucide-react';

export default async function StartScreen() {
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const zalogowany = !!user;
  const href = zalogowany ? '/dashboard' : '/auth/login';

  return (
    <main className="relative w-full h-dvh overflow-hidden bg-slate-950 pt-0">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-hero-mobile.png"
          alt="Talent"
          fill
          
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          style={{ filter: 'contrast(1.08) saturate(1.12) brightness(1.02)' }}
        />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src="/talent-hero.png"
          alt="Talent"
          fill
          
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          style={{ filter: 'contrast(1.08) saturate(1.12) brightness(1.02)' }}
        />
      </div>

      <div className="relative z-20 h-full flex flex-col items-center justify-end px-6 pb-24">
        <Link
          href={href}
          className="group w-full max-w-xs flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-green-500/60 hover:-translate-y-1 border-2 border-white/30 shadow-lg shadow-black/40"
        >
          {zalogowany ? (
            <>
              Wejdź do aplikacji
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Zaloguj się
            </>
          )}
        </Link>
      </div>
    </main>
  );
}