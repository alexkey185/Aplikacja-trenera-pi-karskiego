import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Brak autoryzacji', { status: 401 });
  }

  // Pobieramy wszystko, co należy do użytkownika (dzięki RLS i relacjom)
  const { data: druzyny } = await supabase
    .from('druzyny')
    .select(`
      *,
      zawodnicy (*),
      treningi (
        *,
        obecnosc (*)
      )
    `)
    .eq('user_id', user.id);

  const backupData = {
    meta: {
      exportDate: new Date().toISOString(),
      userEmail: user.email,
      appVersion: '1.0'
    },
    druzyny: druzyny || []
  };

  const jsonString = JSON.stringify(backupData, null, 2);

  return new NextResponse(jsonString, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="talent-backup-${new Date().toISOString().split('T')[0]}.json"`
    }
  });
}