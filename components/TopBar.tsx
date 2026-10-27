import { Suspense } from 'react';
import { getDruzyny, getActiveDruzynaId, getZawodnicyCounts } from '@/lib/druzyny';
import { DruzynaSwitcher } from './DruzynaSwitcher';
import { UserAvatar } from './UserAvatar';
import { TopBarSkeleton } from './TopBarSkeleton';

async function TopBarContent() {
  try {
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
  } catch (error) {
    console.error('Błąd w TopBar (najprawdopodobniej RLS):', error);
    // W razie błędu zwracamy sam awatar, żeby nie wysypać całej strony
    return (
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <UserAvatar />
      </div>
    );
  }
}

export function TopBar() {
  return (
    <Suspense fallback={<TopBarSkeleton />}>
      <TopBarContent />
    </Suspense>
  );
}