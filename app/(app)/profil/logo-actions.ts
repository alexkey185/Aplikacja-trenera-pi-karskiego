'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { revalidatePath } from 'next/cache';

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();

  if (!druzynaId) return { error: 'Brak aktywnej drużyny.' };

  const file = formData.get('logo') as File;
  if (!file || file.size === 0) return { error: 'Nie wybrano pliku.' };

  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Plik jest za duży (maksymalnie 2 MB).' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
    return { error: 'Dozwolone formaty: PNG, JPG, WEBP.' };
  }

  const filePath = `${druzynaId}/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('club-logos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('club-logos')
    .getPublicUrl(filePath);

  const finalUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await supabase
    .from('druzyny')
    .update({ logo_url: finalUrl })
    .eq('id', druzynaId);

  if (dbError) return { error: dbError.message };

  revalidatePath('/profil');
  revalidatePath('/dashboard');
  revalidatePath('/druzyny');
  revalidatePath('/', 'layout');

  return { success: true, url: finalUrl };
}