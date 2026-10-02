'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════
// Mapa komunikatów — klucz → { type, title, description? }
// ═══════════════════════════════════════════════════
const MESSAGES: Record<
  string,
  { type: 'success' | 'error' | 'info' | 'warning'; title: string; description?: string }
> = {
  // ── Zawodnicy ──
  zawodnik_dodany: { type: 'success', title: 'Zawodnik dodany' },
  zawodnik_zapisany: { type: 'success', title: 'Zawodnik zapisany' },
  zawodnik_usuniety: { type: 'success', title: 'Zawodnik usunięty' },

  // ── Treningi ──
  trening_dodany: { type: 'success', title: 'Trening dodany' },
  trening_zapisany: { type: 'success', title: 'Trening zapisany' },
  trening_usuniety: { type: 'success', title: 'Trening usunięty' },
  trening_przeniesiony: { type: 'success', title: 'Trening przeniesiony' },
  seria_usunieta: { type: 'success', title: 'Cała seria usunięta' },

  // ── Obecność ──
  obecnosc_zapisana: { type: 'success', title: 'Obecność zapisana' },

  // ── Drużyny ──
  druzyna_dodana: { type: 'success', title: 'Drużyna utworzona' },
  druzyna_zapisana: { type: 'success', title: 'Drużyna zapisana' },
  druzyna_usunieta: { type: 'success', title: 'Drużyna usunięta' },

  // ── Profil ──
  profil_zapisany: { type: 'success', title: 'Profil zapisany' },

  // ── Błędy ──
  blad: { type: 'error', title: 'Coś poszło nie tak' },
};

export function ToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Guard przed podwójnym odpaleniem w React Strict Mode
  // Resetowany gdy URL nie ma już ?toast=...
  const ostatniKlucz = useRef<string | null>(null);

  useEffect(() => {
    const key = searchParams.get('toast');

    // ═══════════════════════════════════════════════════
    // Brak toastu w URL → zresetuj guard.
    //
    // To jest kluczowe: wcześniej reset odbywał się przez setTimeout
    // z cleanup-em, ale cleanup kasował timer zanim się wykonał.
    // Efekt: ten sam toast pokazywał się tylko raz na sesję.
    //
    // Teraz reset następuje naturalnie — po router.replace() URL
    // nie ma już ?toast=..., więc searchParams się zmieni, efekt
    // re-runuje z key === null i czyści ref.
    // ═══════════════════════════════════════════════════
    if (!key) {
      ostatniKlucz.current = null;
      return;
    }

    // Ten sam klucz już pokazany (Strict Mode dubluje efekt) → pomiń
    if (ostatniKlucz.current === key) return;
    ostatniKlucz.current = key;

    const msg = MESSAGES[key];
    if (msg) {
      const fn = toast[msg.type];
      fn(msg.title, { description: msg.description });
    } else {
      toast.info('Gotowe');
    }

    // Usuń ?toast=... z URL (bez przeładowania)
    const params = new URLSearchParams(searchParams.toString());
    params.delete('toast');
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}