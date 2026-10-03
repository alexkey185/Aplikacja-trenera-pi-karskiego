'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function przeniesTrening(
  id: number,
  newDate: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    return { error: 'Nieprawidłowy format daty.' };
  }

  const { error } = await supabase
    .from('treningi')
    .update({ data: newDate })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/kalendarz');
  revalidatePath('/dashboard');
  return { success: true };
}