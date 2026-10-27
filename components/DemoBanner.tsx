'use client';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import Link from 'next/link';

export function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Sprawdź URL i/lub cookie
    const params = new URLSearchParams(window.location.search);
    const urlDemo = params.get('demo') === 'true';

    // Sprawdź czy to konto demo (po cookie/email)
    const cookies = document.cookie.split(';').map((c) => c.trim());
    const hasDemoFlag = cookies.some((c) => c.startsWith('demo_mode='));

    setIsDemo(urlDemo || hasDemoFlag);
  }, []);

  if (!isDemo) return null;

  return (
    <div className="w-full bg-blue-500/20 border-b border-blue-400/40 backdrop-blur-md py-2 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold text-blue-200 sticky top-0 z-50 shadow-lg shadow-blue-500/10">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>Tryb demo — dane przykładowe, zmiany nie są trwałe.</span>
      </div>
      <Link
        href="/auth/sign-up"
        className="underline hover:text-white transition-colors"
      >
        Załóż własne konto →
      </Link>
    </div>
  );
}