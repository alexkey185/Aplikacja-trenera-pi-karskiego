'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function zapiszObecnosc(treningId: number, formData: FormData) {
  if (!Number.isInteger(treningId) || treningId <= 0) throw new Error('Nieprawidłowe ID treningu.');

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) throw new Error('Brak aktywnej drużyny.');

  const { data: { user } } = await supabase.auth.getUser();
  if (user) await enforceRateLimit(`user:${user.id}`, 'zapiszObecnosc', 200, 3600);

  const updates: { zawodnik_id: number; status: string }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('status_')) continue;
    const zawodnikId = Number(key.slice('status_'.length));
    if (typeof value === 'string' && (value === 'obecny' || value === 'nieobecny')) {
      updates.push({ zawodnik_id: zawodnikId, status: value });
    }
  }

  if (updates.length > 0) {
    const { error } = await supabase.rpc('zapisz_obecnosc', {
      trening_id_param: treningId,
      statusy_param: updates,
    });
    
    if (error) {
      console.error('RPC Error:', error);
      throw new Error('Nie udało się zapisać obecności.');
    }
  }

  revalidatePath('/kalendarz');
  revalidatePath(`/kalendarz/${treningId}/obecnosc`);
  revalidatePath('/dashboard');
  revalidatePath('/statystyki');
  redirect('/kalendarz?toast=obecnosc_zapisana');
}