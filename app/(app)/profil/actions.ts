'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function zaktualizujProfil(formData: FormData) {
  const supabase = await createClient();
  const imie = (formData.get('imie') as string)?.trim();
  const nazwisko = (formData.get('nazwisko') as string)?.trim();
  const { error } = await supabase.auth.updateUser({
    data: { imie, nazwisko },
  });
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath('/profil');
  revalidatePath('/dashboard');
  revalidatePath('/kadra');
  revalidatePath('/kalendarz');
}

export async function wyloguj() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

// ═══════════════════════════════════════════════════════════════
// USUWANIE KONTA - zgodne z RODO (prawo do bycia zapomnianym)
//
// Kolejność jest ważna:
//   1. Usuń dane zależne (zgłoszenia, zgody)
//   2. Usuń drużyny - kaskada FK usunie zawodników, treningi, obecności
//   3. Usuń konto auth
//   4. Wyloguj i przekieruj
// ═══════════════════════════════════════════════════════════════
export async function usunKonto(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();

  // ─── 1. Usuń zgłoszenia pomocy (jeśli istnieją) ───
  await adminClient.from('zgloszenia').delete().eq('user_id', user.id);

  // ─── 2. Usuń zgody RODO ───
  await adminClient.from('user_consents').delete().eq('user_id', user.id);

  // ─── 3. Usuń drużyny ──
  // Kaskada FK w bazie usunie automatycznie:
  //   - zawodnicy (i ich obecności przez FK)
  //   - treningi (i ich obecności przez FK)
