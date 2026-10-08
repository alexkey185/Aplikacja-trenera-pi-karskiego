import Image from 'next/image';
import { Suspense } from 'react';
import { ToastListener } from '@/components/ToastListener';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

      {/* Tło — mobile */}
      <div className="fixed inset-0 z-0 md:hidden">
        <Image
          src="/talent-bg-mobile.webp"
          alt=""
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>

      {/* Tło — desktop */}
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src="/talent-bg.webp"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
      </div>

      {/* Overlay + blur — blur tylko na desktopie */}
      <div className="fixed inset-0 z-10 bg-slate-950/70 md:backdrop-blur-sm" />

      {/* Zawartość
          .app-content — padding-top: max(4.5rem, env(safe-area-inset-top))
          na mobile (bezpiecznie pod pasek statusu iPhone z dynamic island).
          md:pt-6 lg:pt-8 — normalny padding na desktopie.
          pb-28 — miejsce na bottom nav na mobile. */}
      <div className="app-content relative z-20 px-4 md:px-6 lg:px-8 pb-28 md:pt-6 lg:pt-8">
        {children}
      </div>

      <PWAInstallPrompt />
    </main>
  );
}