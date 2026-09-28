'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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