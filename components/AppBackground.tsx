export function AppBackground({ priority = false }: { priority?: boolean }) {
  return (
    <>
      {/* Mobile: czysty kolor zamiast obrazka (błyskawiczne ładowanie, zero obciążenia GPU) */}
      <div className="fixed inset-0 z-0 bg-[#0a0e1a] md:hidden" />

      {/* Desktop: obrazek tła (zostaje dla efektu) */}
      <div className="fixed inset-0 z-0 hidden md:block">
        <img
          src="/talent-bg.webp"
          alt=""
          aria-hidden
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Nakładka: na mobile bez blura (oszczędność FPS), na desktopie z blurem */}
      <div className="fixed inset-0 z-10 bg-slate-950/80 md:bg-slate-950/70 md:backdrop-blur-sm" />
    </>
  );
}