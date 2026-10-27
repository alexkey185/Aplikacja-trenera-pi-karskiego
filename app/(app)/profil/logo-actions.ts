'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getErrorMessage } from '@/lib/errors';
import { revalidatePath } from 'next/cache';

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp'];

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient();
  const druzynaId = await getActiveDruzynaId();

  if (!druzynaId) return { error: 'Brak aktywnej drużyny.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    try {
      await enforceRateLimit(`user:${user.id}`, 'uploadLogo', 10, 3600);
    } catch (err) {
      return { error: getErrorMessage(err) };
    }
  }

  const file = formData.get('logo') as File;
  if (!file || file.size === 0) return { error: 'Nie wybrano pliku.' };

  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Plik jest za duży (maksymalnie 2 MB).' };
  }

  if (!ALLOWED_MIMES.includes(file.type)) {
    return { error: 'Dozwolone formaty: PNG, JPG, WEBP.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filePath = `${druzynaId}/logo.${ext}`;

  try {
    const { data: existingFiles } = await supabase.storage.from('club-logos').list(druzynaId);
    if (existingFiles && existingFiles.length > 0) {
      const pathsToRemove = existingFiles.map((f) => `${druzynaId}/${f.name}`);
      await supabase.storage.from('club-logos').remove(pathsToRemove);
    }
  } catch (err) {
    console.error('Błąd czyszczenia starego logo:', err);
  }

  const { error: uploadError } = await supabase.storage
    .from('club-logos')
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: getErrorMessage(uploadError) };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('club-logos').getPublicUrl(filePath);
  const finalUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await supabase
    .from('druzyny')
    .update({ logo_url: finalUrl })
    .eq('id', druzynaId);

  if (dbError) {
    await supabase.storage.from('club-logos').remove([filePath]);
    return { error: getErrorMessage(dbError) };
  }

  revalidatePath('/profil');
  revalidatePath('/dashboard');
  revalidatePath('/druzyny');
  revalidatePath('/', 'layout');

  return { success: true, url: finalUrl };
}