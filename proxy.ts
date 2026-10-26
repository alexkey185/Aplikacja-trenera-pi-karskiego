'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// P2.7: Walidacja danych profilu przez Zod
const profilSchema = z.object({
  imie: z
    .string()
    .trim()
    .max(50, 'Imię może mieć maksymalnie 50 znaków')
    .optional(),
  nazwisko: z
    .string()
    .trim()
    .max(50, 'Nazwisko może mieć maksymalnie 50 znaków')
    .optional(),
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

// P2.7: Czyszczenie storage przy usuwaniu konta
export async function usunKonto(): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Krok 1: Pobierz drużyny użytkownika (przez jego własny klient — RLS gwarantuje poprawność)
  const { data: druzyny } = await supabase
    .from('druzyny')
    .select('id')
    .eq('user_id', user.id);

  // Krok 2: Usuń pliki z bucketu club-logos (jeśli istnieją)
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
        console.error('Błąd czyszczenia storage:', storageError.message);
        // Kontynuujemy mimo błędu — usunięcie konta jest ważniejsze
      }
    }
  }

  // Krok 3: Usuń użytkownika z auth.users (admin client, omija RLS)
  // Kaskadowe FK w bazie usuną:
  //   - zawodników (i ich obecności przez FK)
  //   - treningi (i ich obecności przez FK)
  //   - drużyny
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