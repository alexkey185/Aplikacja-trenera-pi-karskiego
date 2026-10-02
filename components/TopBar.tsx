import { getDruzyny, getActiveDruzynaId, getZawodnicyCounts } from '@/lib/druzyny';
import { DruzynaSwitcher } from './DruzynaSwitcher';
import { UserAvatar } from './UserAvatar';

export async function TopBar() {
  // ═══════════════════════════════════════════════════
  // Te trzy wywołania są darmowe jeśli w tym samym
  // render pass zawołał je już layout albo page —
  // cache() z React dedupuje.
  // ═══════════════════════════════════════════════════
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

  const zawodnicyCount = await getZawodnicyCounts();

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