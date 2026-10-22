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
    <div className="relative flex-shrink-0">
      {/* Poświata za ikoną/logo */}
      <div
        className={`absolute inset-0 rounded-2xl blur-lg opacity-60 ${
          logoUrl ? 'bg-white/20' : `bg-gradient-to-br ${gradient}`
        }`}
      />
      {/* Kwadrat z logo lub ikoną */}
      <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-lg overflow-hidden">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo klubu"
            className="w-full h-full object-contain p-1 bg-slate-800"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        )}
      </div>
    </div>
  );
}