'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { revalidateKalendarz } from '@/lib/action-result';

export async function przeniesTrening(
  id: number,
  newDate: string
): Promise<{ error?: string; success?: boolean }> {
  if (!Number.isInteger(id) || id <= 0) {
    return { error: 'NieprawidĹ‚owe ID treningu.' };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    return { error: 'NieprawidĹ‚owy format daty.' };
  }
  const [y, m, d] = newDate.split('-').map(Number);
  const roundTrip = new Date(y, m - 1, d);
  if (
    roundTrip.getFullYear() !== y ||
    roundTrip.getMonth() !== m - 1 ||
    roundTrip.getDate() !== d
  ) {
    return { error: 'NieprawidĹ‚owa data.' };
  }

  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) return { error: 'Brak aktywnej druĹĽyny.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    try {
      await enforceRateLimit(`user:${user.id}`, 'przeniesTrening', 100, 3600);
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Za duĹĽo operacji.' };
    }
  }

  const { data: updated, error } = await supabase
    .from('treningi')
    .update({ data: newDate })
    .eq('id', id)
    .eq('druzyna_id', druzynaId)
    .select('id')
    .maybeSingle();

  if (error) return { error: error.message };
  if (!updated) return { error: 'Nie znaleziono treningu.' };

  // RODO-03: audit log dla przeniesienia treningu
  try {
    await supabase.rpc('log_audit', {
      p_action: 'move_trening',
      p_entity_type: 'trening',
      p_entity_id: String(id),
      p_details: { newDate },
    });
  } catch (auditErr) {
    console.error('Audit log failed:', auditErr);
  }

  revalidateKalendarz();
  return { success: true };
}