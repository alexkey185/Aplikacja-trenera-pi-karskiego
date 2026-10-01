export default function PlanLoading() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-slate-800/70 animate-pulse" />
              <div>
                <div className="w-24 h-7 rounded-lg bg-slate-800/70 animate-pulse mb-1" />
                <div className="w-40 h-3 rounded bg-slate-800/50 animate-pulse" />
              </div>
            </div>

            <div className="w-full h-12 rounded-2xl bg-slate-800/60 animate-pulse" />
          </header>

          {/* Pasek statystyk miesięcznych */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-800/70 animate-pulse" />
              <div className="w-32 h-6 rounded-lg bg-slate-800/70 animate-pulse" />
              <div className="w-9 h-9 rounded-xl bg-slate-800/70 animate-pulse" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-slate-800/60 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Lista wydarzeń */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, grupaIdx) => (
              <div key={grupaIdx}>
                <div className="flex items-baseline gap-3 mb-2">
                  <div className="w-10 h-8 rounded bg-slate-800/70 animate-pulse" />
                  <div className="w-24 h-4 rounded bg-slate-800/50 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800/70 animate-pulse" />
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/70 animate-pulse flex-shrink-0" />
                      <div className="w-14 h-6 rounded bg-slate-800/70 animate-pulse" />
                      <div className="w-px h-10 bg-white/10" />
                      <div className="flex-1">
                        <div className="w-2/3 h-4 rounded bg-slate-800/70 animate-pulse mb-2" />
                        <div className="w-1/2 h-3 rounded bg-slate-800/50 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}