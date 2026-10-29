import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getErrorMessage } from '@/lib/errors';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Brak autoryzacji', { status: 401 });
  }

  // ↓↓↓ NOWY: rate limit 3 eksporty na godzinę ↓↓↓
  try {
    await enforceRateLimit(`user:${user.id}`, 'exportBackup', 3, 3600);
  } catch (err) {
    return new NextResponse(
      JSON.stringify({ error: getErrorMessage(err) }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ↓↓↓ NOWY: audit log eksportu ↓↓↓
  await supabase.rpc('log_audit', {
    p_action: 'export_backup',
    p_entity_type: 'all',
    p_entity_id: user.id,
    p_details: { ip: request.headers.get('x-forwarded-for') ?? null },
  });

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

  // ↓↓↓ NOWY: maskowanie kontakt_rodzica ↓↓↓
  const maskedDruzyny = (druzyny || []).map(d => ({
    ...d,
    zawodnicy: (d.zawodnicy || []).map(z => ({
      ...z,
      kontakt_rodzica: z.kontakt_rodzica
        ? z.kontakt_rodzica.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2')
        : null,
    })),
  }));

  const backupData = {
    meta: {
      exportDate: new Date().toISOString(),
      userEmail: user.email,
      appVersion: '1.0',
      exportedBy: user.id,
      note: 'Kontakt do rodzica został zmaskowany. Pełne dane dostępne w aplikacji.',
    },
    druzyny: maskedDruzyny,
  };

  const jsonString = JSON.stringify(backupData, null, 2);

  return new NextResponse(jsonString, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="talent-backup-${new Date().toISOString().split('T')[0]}.json"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });
}