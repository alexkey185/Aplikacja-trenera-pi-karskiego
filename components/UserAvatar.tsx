'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from 'lucide-react';

export function UserAvatar() {
  const [email, setEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  // Inicjały z emaila (np. "jan.kowalski@email.pl" → "JK")
  const inicjal = email
    ? email.charAt(0).toUpperCase()
    : '?';

  // ZAWSZE renderujemy <div> z tym samym skeletonem na SSR i CSR initial
  // Po hydratacji (mounted=true) aktualizujemy zawartość
  return (
    <Link
      href="/profil"
      className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 transition-all hover:scale-105"
      aria-label={mounted && email ? `Profil: ${email}` : 'Profil'}
      title={mounted && email ? email : 'Profil'}
    >
      {mounted && email ? inicjal : <User className="w-4 h-4" strokeWidth={2.5} />}
    </Link>
  );
}