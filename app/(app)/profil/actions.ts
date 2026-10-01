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

// ══════════════════════════════════════════════
// USUWANIE KONTA
// ══════════════════════════════════════════════
export async function usunKonto(): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();

  revalidatePath('/');
  revalidatePath('/auth/login');
  redirect('/');
}