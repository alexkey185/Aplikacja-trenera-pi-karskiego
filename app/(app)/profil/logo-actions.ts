'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getErrorMessage } from '@/lib/errors';
import { revalidatePath } from 'next/cache';

// ═══════════════════════════════════════════════════════════════
// P2.6: Magic bytes dla obrazów
// Weryfikacja typu pliku przez pierwsze bajty (nie przez rozszerzenie)
// ═══════════════════════════════════════════════════════════════
const MAGIC_BYTES = {
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpeg: [0xff, 0xd8, 0xff],
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF....WEBP
};

function detectImageType(bytes: Uint8Array): 'png' | 'jpeg' | 'webp' | null {
  const startsWith = (sig: number[]) =>
    sig.every((byte, i) => bytes[i] === byte);

  if (startsWith(MAGIC_BYTES.png)) return 'png';
  if (startsWith(MAGIC_BYTES.jpeg)) return 'jpeg';
  if (startsWith(MAGIC_BYTES.webp)) {
    // WEBP: RIFF ... WEBP (offset 8-12)
    const isWebp =
      bytes[8] === 0x57 && // W
      bytes[9] === 0x45 && // E
      bytes[10] === 0x42 && // B
      bytes[11] === 0x50; // P
    if (isWebp) return 'webp';
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// P2.6: Limit wymiarów (2000×2000 px)
// Logo klubowe nie potrzebuje 4K
// ═══════════════════════════════════════════════════════════════
async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // PNG: IHDR w offset 16-24
    if (detectImageType(bytes) === 'png') {
      const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
      const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
      return { width, height };
    }

    // Dla JPEG i WEBP — pomijamy (skomplikowane parsowanie)
    // Limit rozmiaru pliku (2 MB) wystarczy jako proxy
    return null;
  } catch {
    return null;
  }
}

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    return { error: 'Brak aktywnej drużyny.' };
  }

  // P2.6: Rate limit — 10 zmian logo na godzinę
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
  if (!file || file.size === 0) {
    return { error: 'Nie wybrano pliku.' };
  }

  // P2.6: Limit rozmiaru 2 MB
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Plik jest za duży (maksymalnie 2 MB).' };
  }

  // P2.6: Walidacja MIME (pierwsza linia obrony — nagłówek klienta)
  const allowedMimes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowedMimes.includes(file.type)) {
    return { error: 'Dozwolone formaty: PNG, JPG, WEBP.' };
  }

  // P2.6: Walidacja MAGIC BYTES (druga linia obrony — prawdziwe bajty pliku)
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const detectedType = detectImageType(bytes);

  if (!detectedType) {
    return {
      error: 'Plik nie jest prawidłowym obrazem PNG/JPG/WEBP (nagłówek pliku nie zgadza się z rozszerzeniem).',
    };
  }

  // P2.6: Walidacja wymiarów (tylko PNG — inne parsowanie jest skomplikowane)
  const dims = await getImageDimensions(file);
  if (dims && (dims.width > 2000 || dims.height > 2000)) {
    return {
      error: `Logo może mieć maksymalnie 2000×2000 px (Twój plik: ${dims.width}×${dims.height}).`,
    };
  }

  // P2.6: Sanityzacja nazwy pliku (bez znaków specjalnych, bez polskich ogonków)
  const safeExt = detectedType === 'jpeg' ? 'jpg' : detectedType;
  const filePath = `${druzynaId}/logo.${safeExt}`;

  // P2.6: Usuwanie starych plików logo (rotacja)
  // Usuwamy wszystkie pliki w folderze drużyny, żeby nie było osieroconych
  try {
    const { data: existingFiles } = await supabase.storage
      .from('club-logos')
      .list(druzynaId);

    if (existingFiles && existingFiles.length > 0) {
      const pathsToRemove = existingFiles.map((f) => `${druzynaId}/${f.name}`);
      await supabase.storage.from('club-logos').remove(pathsToRemove);
    }
  } catch (err) {
    console.error('Błąd czyszczenia starego logo:', err);
    // Kontynuujemy — nowy plik jest ważniejszy
  }

  // P2.6: Upload nowego pliku
  const { error: uploadError } = await supabase.storage
    .from('club-logos')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: '3600',
    });

  if (uploadError) {
    return { error: getErrorMessage(uploadError) };
  }

  // P2.6: Publiczny URL z cache-busterem (żeby przeglądarka nie pokazała starego)
  const {
    data: { publicUrl },
  } = supabase.storage.from('club-logos').getPublicUrl(filePath);

  const finalUrl = `${publicUrl}?t=${Date.now()}`;

  // P2.6: Zapis URL w bazie
  const { error: dbError } = await supabase
    .from('druzyny')
    .update({ logo_url: finalUrl })
    .eq('id', druzynaId);

  if (dbError) {
    // Rollback: usuń wgrany plik, bo DB nie zapisała
    await supabase.storage.from('club-logos').remove([filePath]);
    return { error: getErrorMessage(dbError) };
  }

  revalidatePath('/profil');
  revalidatePath('/dashboard');
  revalidatePath('/druzyny');
  revalidatePath('/', 'layout');

  return { success: true, url: finalUrl };
}