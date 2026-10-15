import { Suspense } from 'react';
import { getDruzyny, getActiveDruzynaId, getZawodnicyCounts } from '@/lib/druzyny';
import { DruzynaSwitcher } from './DruzynaSwitcher';
import { UserAvatar } from './UserAvatar';
import { TopBarSkeleton } from './TopBarSkeleton';

// ═══════════════════════════════════════════════════════════════
// Wewnętrzny async komponent — pobiera dane (może używać cookies).
// Jest owinięty w Suspense w sync wrapperze poniżej.
// ═══════════════════════════════════════════════════════════════
async function TopBarContent() {
  const druzyny = await getDruzyny();
  const activeId = await getActiveDruzynaId();

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
      <div className="hidden md:block">
        <UserAvatar />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Publiczny API — sync, owija async część w Suspense.
// Wszystkie istniejące `<TopBar />` w kodzie działają bez zmian.
// ═══════════════════════════════════════════════════════════════
export function TopBar() {
  return (
    <Suspense fallback={<TopBarSkeleton />}>
      <TopBarContent />
    </Suspense>
  );
}