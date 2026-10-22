import type { LucideIcon } from 'lucide-react';

export function PageHeaderLogo({
  icon: Icon,
  logoUrl,
  color = 'green',
}: {
  icon: LucideIcon;
  logoUrl: string | null;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
}) {
  const gradientMap = {
    green: 'from-green-400 via-green-500 to-green-700',
    blue: 'from-blue-400 via-blue-500 to-blue-700',
    purple: 'from-purple-400 via-purple-500 to-purple-700',
    orange: 'from-orange-400 via-orange-500 to-orange-700',
    red: 'from-red-400 via-red-500 to-red-700',
  };

  const gradient = gradientMap[color];

  return (
    <div className="relative group cursor-pointer flex-shrink-0">
      {/* Delikatna poświata z tyłu (mocniejsza przy najechaniu) */}
      <div
        className={`absolute inset-0 rounded-xl blur-md opacity-40 group-hover:opacity-80 transition-all duration-500 ${
          logoUrl ? 'bg-white/40 group-hover:bg-white/60' : `bg-gradient-to-br ${gradient}`
        }`}
      />

      {/* Główny kafelek (ikona aplikacji) */}
      <div
        className={`relative w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:-translate-y-0.5 ${
          logoUrl
            ? 'bg-white ring-1 ring-black/10 p-1.5' // Czyste białe tło dla pliku z logo
            : `bg-gradient-to-br ${gradient}` // Gradient dla domyślnej ikony
        }`}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo klubu"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white drop-shadow-md" strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
}