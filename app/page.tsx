import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { LogIn } from 'lucide-react';

export default async function StartScreen() {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const href = user ? '/kadra' : '/auth/login';

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* TŁO — pełnoekranowa grafika, wyostrzona */}
      <div
        className="absolute inset-0 z-0"
        style={{
          filter: 'contrast(1.08) saturate(1.12) brightness(1.02)',
        }}
      >
        <Image
          src="/talent-hero.png"
          alt="Talent"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* TREŚĆ — przycisk na dole */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-end px-6 pb-6">
        <Link
          href={href}
          className="group w-full max-w-xs flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-green-500/60 hover:-translate-y-1 border-2 border-white/30 shadow-lg shadow-black/40"
        >
          <LogIn className="w-5 h-5" />
          Zaloguj się
        </Link>

        <p className="text-center text-xs text-white/70 pt-3 drop-shadow">
          Wersja 1.0 · Twój zespół, Twoje zasady
        </p>
      </div>
    </main>
  );
}