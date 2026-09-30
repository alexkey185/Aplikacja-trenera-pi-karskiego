import { getDruzyny, getActiveDruzynaId } from '@/lib/druzyny';
import { createClient } from '@/lib/supabase/server';
import { DruzynaSwitcher } from './DruzynaSwitcher';
import { UserAvatar } from './UserAvatar';

export async function TopBar() {
  const druzyny = await getDruzyny();
  const activeId = await getActiveDruzynaId();

  // Brak drużyn — pokaż tylko UserAvatar (i to tylko na desktopie)
  if (druzyny.length === 0 || !activeId) {
    return (
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <UserAvatar />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: zawodnicy } = await supabase
    .from('zawodnicy')
    .select('druzyna_id');

  const zawodnicyCount: Record<string, number> = {};
  (zawodnicy ?? []).forEach((z) => {
    if (z.druzyna_id) {
      zawodnicyCount[z.druzyna_id] = (zawodnicyCount[z.druzyna_id] ?? 0) + 1;
    }
  });

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <DruzynaSwitcher
        druzyny={druzyny}
        activeId={activeId}
        zawodnicyCount={zawodnicyCount}
      />
      {/* UserAvatar tylko na desktopie — na mobile jest w dolnej nawigacji „Profil" */}
      <div className="hidden md:block">
        <UserAvatar />
      </div>
    </div>
  );
}