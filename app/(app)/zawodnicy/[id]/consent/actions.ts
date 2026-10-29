'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getErrorMessage } from '@/lib/errors';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const consentSchema = z.object({
  zawodnik_id: z.coerce.number().int().positive(),
  druzyna_id: z.string().uuid(),
  consent_type: z.enum(['rodzic', 'opiekun']),
  consent_holder_name: z.string().trim().min(2, 'Imię i nazwisko min. 2 znaki').max(100),
  consent_holder_email: z.string().email().optional().or(z.literal('')),
  consent_holder_phone: z.string().max(20).optional().or(z.literal('')),
  consent_method: z.enum(['paper', 'electronic', 'verbal']),
  consent_notes: z.string().max(500).optional().or(z.literal('')),
});

export type FormState = { error?: string; success?: boolean } | null;

export async function zapiszZgode(formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Musisz być zalogowany.' };

  try {
    await enforceRateLimit(`user:${user.id}`, 'zapiszZgode', 30, 3600);
  } catch (err) {
    return { error: getErrorMessage(err) };
  }

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId || druzynaId !== formData.get('druzyna_id')) {
    return { error: 'Brak uprawnień do tej drużyny.' };
  }

  const parsed = consentSchema.safeParse({
    zawodnik_id: formData.get('zawodnik_id'),
    druzyna_id: formData.get('druzyna_id'),
    consent_type: formData.get('consent_type'),
    consent_holder_name: formData.get('consent_holder_name'),
    consent_holder_email: formData.get('consent_holder_email') || '',
    consent_holder_phone: formData.get('consent_holder_phone') || '',
    consent_method: formData.get('consent_method'),
    consent_notes: formData.get('consent_notes') || '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from('zawodnik_consents').insert({
    ...parsed.data,
    consent_holder_email: parsed.data.consent_holder_email || null,
    consent_holder_phone: parsed.data.consent_holder_phone || null,
    consent_notes: parsed.data.consent_notes || null,
    user_id: user.id,
  });

  if (error) {
    return { error: getErrorMessage(error) };
  }

  // Audit log
  await supabase.rpc('log_audit', {
    p_action: 'add_consent',
    p_entity_type: 'zawodnik',
    p_entity_id: String(parsed.data.zawodnik_id),
  });

  revalidatePath(`/zawodnicy/${parsed.data.zawodnik_id}/consent`);
  return { success: true };
}

export async function usunZgode(formData: FormData): Promise<FormState> {
  const id = parseInt(formData.get('id') as string, 10);
  if (!id || isNaN(id)) return { error: 'Nieprawidłowe ID.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Musisz być zalogowany.' };

  // Weryfikacja właścicielstwa (przez druzyna_id)
  const { data: consent } = await supabase
    .from('zawodnik_consents')
    .select('druzyna_id, zawodnik_id')
    .eq('id', id)
    .single();

  if (!consent) return { error: 'Nie znaleziono zgody.' };

  const { data: druzyna } = await supabase
    .from('druzyny')
    .select('user_id')
    .eq('id', consent.druzyna_id)
    .single();

  if (!druzyna || druzyna.user_id !== user.id) {
    return { error: 'Brak uprawnień.' };
  }

  const { error } = await supabase
    .from('zawodnik_consents')
    .delete()
    .eq('id', id);

  if (error) return { error: getErrorMessage(error) };

  await supabase.rpc('log_audit', {
    p_action: 'delete_consent',
    p_entity_type: 'zawodnik',
    p_entity_id: String(consent.zawodnik_id),
  });

  revalidatePath(`/zawodnicy/${consent.zawodnik_id}/consent`);
  return { success: true };
}