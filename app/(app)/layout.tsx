import Image from 'next/image';
import { Suspense } from 'react';
import { ToastListener } from '@/components/ToastListener';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

      {/* ... tło ... */}

      <div className="relative z-20 p-4 md:p-6 lg:p-8 pb-28">{children}</div>
    </main>
  );
}