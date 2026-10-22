import Image from 'next/image';

/**
 * Tło aplikacji — jedno źródło prawdy dla wszystkich layoutów.
 *
 * Zamiast dwóch `<Image fill>` (jeden mobile, jeden desktop), używamy
 * natywnego `<picture>` z `media`. Przeglądarka pobiera TYLKO jeden
 * obraz — mobile nie ściąga desktopowego wariantu i odwrotnie.
 *
 * Oszczędność: ~100-300 KB transferu na mobile.
 */
export function AppBackground({ priority = false }: { priority?: boolean }) {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/talent-bg-mobile.webp"
            type="image/webp"
          />
          <source
            media="(min-width: 768px)"
            srcSet="/talent-bg.webp"
            type="image/webp"
          />
          {/* Fallback dla bardzo starych przeglądarek */}
          <img
            src="/talent-bg.webp"
            alt=""
            aria-hidden
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </picture>
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 md:backdrop-blur-sm" />
    </>
  );
}