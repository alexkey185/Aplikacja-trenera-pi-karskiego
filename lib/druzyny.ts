import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const ACTIVE_DRUZYNA_COOKIE = 'active_druzyna_id';

export type Druzyna = {
  id: string;
  nazwa: string;
  rocznik: number | null;
  kolor: string;
  created_at: string;
};

// ═══════════════════════════════════════════════════
// cache() z React — dedupuje wywołania w obrębie JEDNEGO requestu.
//
// Problem: layout, page i TopBar niezależnie wołają getDruzyny()
// i getActiveDruzynaId(). Bez cache to 4 zapytania do tej samej
// tabeli przy każdym wejściu na stronę.
//
// Cache trzyma wynik tylko w obrębie jednego render pass — między
// requestami zawsze świeże dane. Nie mylić z unstable_cache z Next.js
// (ten cache'uje między requestami — niebezpieczne dla cookies).
// ═══════════════════════════════════════════════════

export const getDruzyny = cache(async (): Promise<Druzyna[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('druzyny')
    .select('id, nazwa, rocznik, kolor, created_at')
    .order('created_at', { ascending: true });
  return (data ?? []) as Druzyna[];
});

export const getActiveDruzynaId = cache(async (): Promise<string | null> => {
  const druzyny = await getDruzyny();
  if (druzyny.length === 0) return null;

  const cookieStore = await cookies();
  const active = cookieStore.get(ACTIVE_DRUZYNA_COOKIE)?.value;

  if (active && druzyny.some((d) => d.id === active)) {
    return active;
  }

  return druzyny[0].id;
});

export const getActiveDruzyna = cache(async (): Promise<Druzyna | null> => {
  const id = await getActiveDruzynaId();
  if (!id) return null;
  const druzyny = await getDruzyny();
  return druzyny.find((d) => d.id === id) ?? null;
});

// ═══════════════════════════════════════════════════
// Zawodnicy per drużyna — liczba do badge'a w DruzynaSwitcher.
// Też cache, żeby TopBar nie robił zapytania za każdym razem.
// ═══════════════════════════════════════════════════
export const getZawodnicyCounts = cache(
  async (): Promise<Record<string, number>> => {
    const supabase = await createClient();
    const { data } = await supabase.from('zawodnicy').select('druzyna_id');

    const counts: Record<string, number> = {};
    (data ?? []).forEach((z) => {
      if (z.druzyna_id) {
        counts[z.druzyna_id] = (counts[z.druzyna_id] ?? 0) + 1;
      }
    });
    return counts;
  }
);