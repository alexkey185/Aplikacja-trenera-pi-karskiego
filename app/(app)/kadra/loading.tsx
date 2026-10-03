export default function KadraLoading() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-10 bg-slate-950/70 md:backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/70 animate-pulse" />
                <div>
                  <div className="w-52 h-6 rounded-lg bg-slate-800/70 animate-pulse mb-2" />
                  <div className="w-32 h-3 rounded bg-slate-800/50 animate-pulse" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800/70 animate-pulse" />
            </div>

            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-32 h-11 rounded-2xl bg-slate-800/60 animate-pulse"
                />
              ))}
            </div>
          </header>

          {/* Grid kart */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="w-3/4 h-4 rounded bg-slate-800/70 animate-pulse mb-2" />
                  <div className="w-1/2 h-3 rounded bg-slate-800/50 animate-pulse mb-1" />
                  <div className="w-2/3 h-3 rounded bg-slate-800/40 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}