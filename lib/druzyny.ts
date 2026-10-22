import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const ACTIVE_DRUZYNA_COOKIE = 'active_druzyna_id';

export type Druzyna = {
  id: string;
  nazwa: string;
  rocznik: number | null;
  kolor: string;
  created_at: string;
};

// ═══════════════════════════════════════════════════════════════
// Cache tagi - używane w revalidateTag po mutacji.
// - DRUZYNY_CACHE_TAG   → lista drużyn usera
// - ZAWODNICY_CACHE_TAG → liczba zawodników per drużyna (TopBar)
// ═══════════════════════════════════════════════════════════════
export const DRUZYNY_CACHE_TAG = 'druzyny';
export const ZAWODNICY_CACHE_TAG = 'zawodnicy-counts';

// ═══════════════════════════════════════════════════════════════
// Cache WEWNĘTRZNY - nie czyta cookies, więc może być
// cross-requestowy. Klucz zawiera userId (user-specific cache).
// ═══════════════════════════════════════════════════════════════
const _getDruzynyForUser = unstable_cache(
  async (userId: string): Promise<Druzyna[]> => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('druzyny')
      .select('id, nazwa, rocznik, kolor, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    return (data ?? []) as Druzyna[];
  },
  ['druzyny-by-user'],
  { tags: [DRUZYNY_CACHE_TAG], revalidate: 60 }
);

// ═══════════════════════════════════════════════════════════════
// Liczba zawodników per drużyna - cache cross-request.
//
// NIE używamy RPC `get_zawodnicy_counts`, bo prawdopodobnie
// filtruje po auth.uid() (RLS), a createAdminClient nie ma sesji.
// Zamiast tego: 2 zapytania (druzyny + zawodnicy) + count w JS.
//
// Cache 60s + tag ZAWODNICY_CACHE_TAG, revalidowany w mutacjach.
// ═══════════════════════════════════════════════════════════════
const _getZawodnicyCountsForUser = unstable_cache(
  async (userId: string): Promise<Record<string, number>> => {
    const supabase = createAdminClient();

    // 1. Pobierz ID drużyn usera
    const { data: druzyny } = await supabase
      .from('druzyny')
      .select('id')
      .eq('user_id', userId);

    if (!druzyny || druzyny.length === 0) return {};

    const druzynaIds = druzyny.map((d) => d.id);

    // 2. Pobierz zawodników tych drużyn
    const { data: zawodnicy } = await supabase
      .from('zawodnicy')
      .select('druzyna_id')
      .in('druzyna_id', druzynaIds);

    // 3. Zlicz w JS (tanio - kilkadziesiąt wierszy)
    const counts: Record<string, number> = {};
    (zawodnicy ?? []).forEach((z) => {
      if (z.druzyna_id) {
        counts[z.druzyna_id] = (counts[z.druzyna_id] ?? 0) + 1;
      }
    });
    return counts;
  },
  ['zawodnicy-counts-by-user'],
  { tags: [ZAWODNICY_CACHE_TAG], revalidate: 60 }
);

// ═══════════════════════════════════════════════════════════════
// Publiczne API - czyta usera z cookies, potem uderza w cache.
// React cache() dodatkowo dedupuje w obrębie jednego requestu.
// ═══════════════════════════════════════════════════════════════
export const getDruzyny = cache(async (): Promise<Druzyna[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return _getDruzynyForUser(user.id);
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

// ═══════════════════════════════════════════════════════════════
// Liczba zawodników per drużyna - publiczne API.
// React cache() dedupuje w obrębie requestu,
// unstable_cache() cache'uje między requestami.
// ═══════════════════════════════════════════════════════════════
export const getZawodnicyCounts = cache(
  async (): Promise<Record<string, number>> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return {};
    return _getZawodnicyCountsForUser(user.id);
  }
);