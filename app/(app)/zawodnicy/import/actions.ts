$content = @'
'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveDruzynaId, ZAWODNICY_CACHE_TAG } from '@/lib/druzyny';
import { enforceRateLimit } from '@/lib/rate-limit';
import { parseImportText } from '@/lib/import-parser';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function importZawodnicy(formData: FormData) {
  const supabase = await createClient();

  const druzynaId = await getActiveDruzynaId();
  if (!druzynaId) {
    throw new Error('Brak aktywnej drużyny.');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await enforceRateLimit(`user:${user.id}`, 'importZawodnicy', 5, 3600);
  }

  const text = (formData.get('dane') as string) ?? '';
  if (!text.trim()) {
    throw new Error('Wklej dane do zaimportowania.');
  }

  const { rows, errors } = parseImportText(text);

  if (rows.length === 0) {
    throw new Error(
      errors.length > 0
        ? `Nie znaleziono poprawnych wierszy (błędów: ${errors.length}).`
        : 'Nie znaleziono poprawnych wierszy do importu.'
    );
  }

  if (rows.length > 200) {
    throw new Error('Maksymalnie 200 zawodników na raz. Podziel na mniejsze partie.');
  }

  const insertRows = rows.map((r) => ({
    ...r,
    druzyna_id: druzynaId,
  }));

  const { error } = await supabase.from('zawodnicy').insert(insertRows);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTag(ZAWODNICY_CACHE_TAG, 'default');
  revalidatePath('/kadra');
  redirect('/kadra?toast=zawodnicy_zaimportowani');
}
'@

$path = Join-Path (Get-Location) "app\(app)\zawodnicy\import\actions.ts"
[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Zapisano: $path"