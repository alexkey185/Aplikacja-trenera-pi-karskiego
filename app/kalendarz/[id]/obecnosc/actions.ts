'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function zapiszObecnosc(treningId: number, formData: FormData) {
  const supabase = await createClient();

  const updates: {
    trening_id: number;
    zawodnik_id: number;
    status: string;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('status_')) {
      const zawodnikId = parseInt(key.replace('status_', ''), 10);
      if (!isNaN(zawodnikId)) {
        updates.push({
          trening_id: treningId,
          zawodnik_id: zawodnikId,
          status: value as string,
        });
      }
    }
  }

  if (updates.length === 0) {
    redirect('/kalendarz');
  }

  const { error } = await supabase
    .from('obecnosc')
    .upsert(updates, { onConflict: 'trening_id,zawodnik_id' });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/kalendarz');
  revalidatePath(`/kalendarz/${treningId}/obecnosc`);
  redirect('/kalendarz');
}