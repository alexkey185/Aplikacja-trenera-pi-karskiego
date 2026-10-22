export function BottomNavSkeleton() {
  return (
    <>
      {/* Desktop sidebar skeleton */}
      <aside
        aria-hidden="true"
        className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-50 bg-slate-900/95 backdrop-blur-xl border-r border-white/10"
      >
        <div className="p-5 border-b border-white/10">
          <div className="h-9 w-32 rounded bg-slate-800/70 animate-pulse" />
        </div>
        <nav className="flex-1 p-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-xl bg-slate-800/50 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="h-14 rounded-xl bg-slate-800/50 animate-pulse" />
          <div className="h-10 rounded-xl bg-slate-800/50 animate-pulse" />
        </div>
      </aside>

      {/* Mobile bottom nav skeleton */}
      <nav
        aria-hidden="true"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="bg-slate-900/90 backdrop-blur-xl border-t border-white/10 px-2 pb-2 pt-2 flex justify-around shadow-2xl shadow-black/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center flex-1 py-2"
            >
              <div className="w-5 h-5 mb-0.5 rounded bg-slate-800/70 animate-pulse" />
              <div className="w-8 h-2 rounded bg-slate-800/50 animate-pulse" />
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}