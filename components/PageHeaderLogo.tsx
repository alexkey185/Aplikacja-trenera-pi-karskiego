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
      {/* 1. Dynamiczna poświata z tyłu (mocniejsza przy najechaniu) */}
      <div
        className={`absolute inset-0 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-all duration-500 ${
          logoUrl ? 'bg-white/30 group-hover:bg-white/40' : `bg-gradient-to-br ${gradient}`
        }`}
      />

      {/* 2. Zewnętrzna ramka (szklany efekt + gradient) */}
      <div className="relative w-11 h-11 lg:w-12 lg:h-12 rounded-2xl p-[1.5px] bg-gradient-to-br from-white/40 to-white/5 group-hover:from-white/60 group-hover:to-white/10 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-0.5">
        
        {/* 3. Wewnętrzny pojemnik */}
        <div className="w-full h-full rounded-[14px] bg-slate-900/90 backdrop-blur-md flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            /* Białe tło dla logo (żeby grafika "wyskoczyła" z ciemnego motywu) */
            <div className="w-[90%] h-[90%] p-0.5 bg-white/95 rounded-xl flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-105">
              <img
                src={logoUrl}
                alt="Logo klubu"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
          ) : (
            /* Domyślna ikona (jeśli nie ma logo) */
            <div
              className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
            >
              <Icon className="w-5 h-5 text-white drop-shadow-md" strokeWidth={2.5} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}