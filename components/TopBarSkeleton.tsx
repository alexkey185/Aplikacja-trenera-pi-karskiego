export function TopBarSkeleton() {
  return (
    <div className="flex items-center gap-2 flex-shrink-0" aria-hidden="true">
      <div className="w-24 h-9 rounded-xl bg-slate-800/70 animate-pulse" />
      <div className="hidden md:block w-10 h-10 rounded-full bg-slate-800/70 animate-pulse" />
    </div>
  );
}