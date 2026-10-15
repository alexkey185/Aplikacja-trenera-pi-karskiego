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
// Cache tag - używany w revalidateTag po mutacji drużyn.
// ═══════════════════════════════════════════════════════════════
export const DRUZYNY_CACHE_TAG = 'druzyny';

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
// Liczba zawodników per drużyna - RPC.
// ═══════════════════════════════════════════════════════════════
export const getZawodnicyCounts = cache(
  async (): Promise<Record<string, number>> => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_zawodnicy_counts');

    if (error) {
      console.error('RPC get_zawodnicy_counts error:', error);
      return {};
    }

    const counts: Record<string, number> = {};
    (data ?? []).forEach((row: { druzyna_id: string; cnt: number }) => {
      counts[row.druzyna_id] = Number(row.cnt);
    });
    return counts;
  }
);