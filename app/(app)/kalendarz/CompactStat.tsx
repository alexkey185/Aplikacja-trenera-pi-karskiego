// app/(app)/kalendarz/CompactStat.tsx
export function CompactStat({
  icon,
  color,
  bg,
  border,
  label,
  value,
}: {
  icon: string;
  color: string;
  bg: string;
  border: string;
  label: string;
  value: number;
}) {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:px-4 lg:py-3 bg-gradient-to-br ${bg} border ${border} animate-fadeIn shadow-lg shadow-black/30 flex flex-col lg:flex-row lg:items-center lg:gap-3`}
    >
      <div className={`${color} text-base lg:text-2xl lg:flex-shrink-0 font-black`}>
        {icon}
      </div>
      <div className="lg:flex-1 lg:min-w-0">
        <div className="text-2xl lg:text-3xl font-bold text-white drop-shadow leading-tight">
          {value}
        </div>
        <div className="text-xs lg:text-xs text-white/60 lg:uppercase lg:tracking-wider lg:font-semibold mt-0.5 lg:mt-0 leading-tight">
          {label}
        </div>
      </div>
    </div>
  );
}