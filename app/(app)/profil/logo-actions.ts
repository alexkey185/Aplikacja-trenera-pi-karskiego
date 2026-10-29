'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getErrorMessage } from '@/lib/errors';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-utils';

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient();

  // ↓↓↓ KLUCZOWA ZMIANA: wymagamy roli admina ↓↓↓
  const druzyna = await requireRole(['admin']);
  const druzynaId = druzyna.id;

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

  if (file.size > MAX_SIZE) {
return { error: `Plik jest za duży (maksymalnie ${MAX_SIZE / 1024 / 1024} MB).` };  }

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

  const { data: { publicUrl } } = supabase.storage.from('club-logos').getPublicUrl(filePath);
  const finalUrl = `${publicUrl}?t=${Date.now()}`;

  // ↓↓↓ KLUCZOWA ZMIANA: filtr user_id jako druga warstwa obrony ↓↓↓
  const { error: dbError } = await supabase
    .from('druzyny')
    .update({ logo_url: finalUrl })
    .eq('id', druzynaId)
    .eq('user_id', user?.id);

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