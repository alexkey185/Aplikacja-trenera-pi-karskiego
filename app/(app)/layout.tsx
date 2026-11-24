import { AppBackground } from '@/components/AppBackground';
import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950">
      <AppBackground />
      
      {/* BottomNav nie przyjmuje teraz propsów */}
      <BottomNav />

      <main className="relative z-10 md:pl-64 pb-24 md:pb-0 w-full min-h-screen">
        <div className="p-4 md:p-6 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}