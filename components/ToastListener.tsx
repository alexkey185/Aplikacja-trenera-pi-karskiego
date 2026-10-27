'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const MESSAGES: Record<
  string,
  {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    description?: string;
  }
> = {
  // Zawodnicy
  zawodnik_dodany: { type: 'success', title: 'Zawodnik dodany' },
  zawodnik_zapisany: { type: 'success', title: 'Zawodnik zapisany' },
  zawodnik_usuniety: { type: 'success', title: 'Zawodnik usunięty' },

  // Treningi
  trening_dodany: { type: 'success', title: 'Trening dodany' },
  trening_zapisany: { type: 'success', title: 'Trening zapisany' },
  trening_usuniety: { type: 'success', title: 'Trening usunięty' },
  trening_przeniesiony: { type: 'success', title: 'Trening przeniesiony' },
  seria_usunieta: { type: 'success', title: 'Cała seria usunięta' },

  // Obecność
  obecnosc_zapisana: { type: 'success', title: 'Obecność zapisana' },

  // Drużyny
  druzyna_dodana: { type: 'success', title: 'Drużyna utworzona' },
  druzyna_zapisana: { type: 'success', title: 'Drużyna zapisana' },
  druzyna_usunieta: { type: 'success', title: 'Drużyna usunięta' },

  // Profil
  profil_zapisany: { type: 'success', title: 'Profil zapisany' },

  // Błędy
  blad: { type: 'error', title: 'Coś poszło nie tak' },
};

export function ToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ostatniKlucz = useRef<string | null>(null);

  useEffect(() => {
    const key = searchParams.get('toast');

    if (!key) {
      ostatniKlucz.current = null;
      return;
    }
    if (ostatniKlucz.current === key) return;
    ostatniKlucz.current = key;

    if (key === 'zawodnicy_zaimportowani') {
      const imp = parseInt(searchParams.get('imported') ?? '0', 10);
      const skip = parseInt(searchParams.get('skipped') ?? '0', 10);
      const slowoImp = imp === 1 ? 'zawodnika' : 'zawodników';
      const desc =
        skip > 0
          ? `Dodano ${imp} ${slowoImp}, pominięto ${skip} ${
              skip === 1 ? 'duplikat' : 'duplikatów'
            }`
          : `Dodano ${imp} ${slowoImp}`;
      toast.success('Import zakończony', { description: desc });
    } else {
      const msg = MESSAGES[key];
      if (msg) {
        const fn = toast[msg.type];
        fn(msg.title, { description: msg.description });
      } else {
        toast.info('Gotowe');
      }
    }

    const params = new URLSearchParams(searchParams.toString());
    ['toast', 'imported', 'skipped'].forEach((k) => params.delete(k));
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}