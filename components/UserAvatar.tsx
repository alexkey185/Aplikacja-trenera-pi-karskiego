'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

export function UserAvatar() {
  const [email, setEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  // Ukryj na ekranie profilu (tam jest już karta użytkownika)
  if (pathname === '/profil') return null;

  const inicjal = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <Link
      href="/profil"
      className="md:hidden relative w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center font-bold text-white text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex-shrink-0 border border-white/20"
      title="Profil"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {email ? inicjal : <User className="w-5 h-5" />}
      </span>
    </Link>
  );
}