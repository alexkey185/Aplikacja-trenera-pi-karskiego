export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Tło — mobile
          fetchPriority="high" → browser wie że to ważny zasób (LCP).
          loading="lazy" NIE — tło ma być widoczne od razu, bez opóźnienia.
          Uwaga: to zwykły <img> (nie Next.js Image) — świadomie, żeby uniknąć
          dodatkowej warstwy optymalizacji dla dekoracyjnego tła. */}
      <div className="fixed inset-0 z-0 md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/talent-bg-mobile.webp"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden
        />
      </div>

      {/* Tło — desktop (bez fetchPriority — mobile jest priorytetem) */}
      <div className="fixed inset-0 z-0 hidden md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/talent-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden
        />
      </div>

      {/* Overlay + blur — blur tylko na desktopie */}
      <div className="fixed inset-0 z-10 bg-slate-950/70 md:backdrop-blur-sm" />

      {/* Zawartość — wyśrodkowana */}
      <div className="relative z-20 min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}