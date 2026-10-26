'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const profilSchema = z.object({
  imie: z.string().trim().max(50, 'Imię może mieć maksymalnie 50 znaków').optional(),
  nazwisko: z.string().trim().max(50, 'Nazwisko może mieć maksymalnie 50 znaków').optional(),
});

export async function zaktualizujProfil(formData: FormData) {
  const supabase = await createClient();

  const raw = {
    imie: formData.get('imie'),
    nazwisko: formData.get('nazwisko'),
  };

  const parsed = profilSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      imie: parsed.data.imie ?? '',
      nazwisko: parsed.data.nazwisko ?? '',
    },
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

export async function usunKonto(): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Krok 1: Pobierz druzyny uzytkownika (przez jego wlasny klient - RLS gwarantuje poprawnosc)
  const { data: druzyny } = await supabase
    .from('druzyny')
    .select('id')
    .eq('user_id', user.id);

  // Krok 2: Usun pliki z bucketu club-logos (jesli istnieja)
  if (druzyny && druzyny.length > 0) {
    const filesToRemove: string[] = [];

    for (const d of druzyny) {
      const { data: files } = await supabase.storage
        .from('club-logos')
        .list(d.id);

      if (files && files.length > 0) {
        for (const f of files) {
          filesToRemove.push(`${d.id}/${f.name}`);
        }
      }
    }

    if (filesToRemove.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('club-logos')
        .remove(filesToRemove);

      if (storageError) {
        console.error('Blad czyszczenia storage:', storageError.message);
      }
    }
  }

  // Krok 3: Usun uzytkownika z auth.users (admin client, omija RLS)
  // Kaskada FK w bazie usunie:
  //   - zawodnikow (i ich obecnosci przez FK)
  //   - treningi (i ich obecnosci przez FK)
  //   - druzyny
  //   - user_consents
  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: error.message };
  }

  // Krok 4: Wyloguj i przekieruj
  await supabase.auth.signOut();

  revalidatePath('/');
  revalidatePath('/auth/login');
  redirect('/');
}