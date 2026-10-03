export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Tło — mobile */}
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

      {/* Tło — desktop */}
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

      {/* ═══════════════════════════════════════════════════════
          Zawartość — WYŚRODKOWANA I OGRANICZONA.
          
          Kluczowe: flex justify-center + wewnętrzny kontener z max-w-md
          (448px). Bez tego formularz rozciąga się na całą szerokość
          ekranu (na 1900px desktop wygląda fatalnie).

          mx-auto — pas bezpieczeństwa, gdyby rodzic nie był flexem.
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-20 min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
    </main>
  );
}