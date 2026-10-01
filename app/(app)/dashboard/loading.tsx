export default function DashboardLoading() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          {/* Header skeleton */}
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/70 animate-pulse" />
                <div>
                  <div className="w-32 h-6 rounded-lg bg-slate-800/70 animate-pulse mb-2" />
                  <div className="w-24 h-3 rounded bg-slate-800/50 animate-pulse" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800/70 animate-pulse" />
            </div>

            {/* Pasek miesiąca */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-800/70 animate-pulse" />
              <div className="text-center">
                <div className="w-32 h-6 rounded-lg bg-slate-800/70 animate-pulse mb-2 mx-auto" />
                <div className="w-20 h-3 rounded bg-slate-800/50 animate-pulse mx-auto" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800/70 animate-pulse" />
            </div>
          </header>

          {/* Kalendarz skeleton */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 mb-5">
            {/* Dni tygodnia */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 rounded bg-slate-800/50 animate-pulse"
                />
              ))}
            </div>

            {/* Dni miesiąca */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-slate-800/40 animate-pulse"
                  style={{ animationDelay: `${(i % 7) * 50}ms` }}
                />
              ))}
            </div>

            {/* Legenda */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800/70 animate-pulse" />
                  <div className="w-12 h-3 rounded bg-slate-800/50 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Przyciski */}
          <div className="flex gap-2 flex-wrap mb-5">
            <div className="flex-1 h-12 rounded-2xl bg-slate-800/60 animate-pulse" />
            <div className="w-24 h-12 rounded-2xl bg-slate-800/60 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}