'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

export function UserAvatar() {
  const [email, setEmail] = useState<string | null>(null);
  const pathname = usePathname();

  // ═══════════════════════════════════════════════════════
  // Stabilny klient Supabase - bez tego każdy render
  // tworzy nową instancję i resetuje useEffect
  // ═══════════════════════════════════════════════════════
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // 1. Pobierz aktualnego usera przy montażu
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    // 2. Nasłuchuj zmian sesji - logowanie, wylogowanie,
    //    przełączenie konta, odświeżenie tokenu
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    // 3. Cleanup przy odmontowaniu komponentu
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Ukryj na ekranie profilu (tam jest już karta użytkownika)
  if (pathname === '/profil') return null;

  const inicjal = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <Link
      href="/profil"
      className="md:hidden relative w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center font-bold text-white text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex-shrink-0 border border-white/20"
      title="Profil"
      aria-label="Otwórz profil"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {email ? inicjal : <User className="w-5 h-5" />}
      </span>
    </Link>
  );
}