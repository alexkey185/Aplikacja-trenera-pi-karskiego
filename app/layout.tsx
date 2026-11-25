import { AppBackground } from '@/components/AppBackground';
import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-[100dvh] w-full bg-[#020617] overflow-x-hidden">
      {/* Tło (z-index: 0) - jest pod wszystkim */}
      <AppBackground />
      
      {/* Menu (ma własny z-index) */}
      <BottomNav />

      {/* 
        Treść (z-index: 10) - jest nad tłem.
        md:pl-64 - zostawia miejsce na boczne menu (desktop)
        pb-20 - zostawia miejsce na dolne menu (mobile)
      */}
      <main className="relative z-10 md:pl-64 pb-20 md:pb-0 w-full min-h-[100dvh]">
        <div className="p-4 md:p-6 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}