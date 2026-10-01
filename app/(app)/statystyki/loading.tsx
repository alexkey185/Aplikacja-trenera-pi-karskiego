export default function StatystykiLoading() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/70 animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800/70 animate-pulse" />
              <div>
                <div className="w-32 h-6 rounded-lg bg-slate-800/70 animate-pulse mb-1" />
                <div className="w-40 h-3 rounded bg-slate-800/50 animate-pulse" />
              </div>
            </div>
          </header>

          {/* 4 kafelki statystyk */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-slate-800/60 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>

          {/* Info o treningach */}
          <div className="h-20 rounded-2xl bg-slate-900/80 border border-white/10 mb-4 animate-pulse" />

          {/* TOP 5 */}
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 mb-4">
            <div className="w-40 h-4 rounded bg-slate-800/70 animate-pulse mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/70 animate-pulse" />
                  <div className="flex-1">
                    <div className="w-2/3 h-4 rounded bg-slate-800/70 animate-pulse mb-1" />
                    <div className="w-1/3 h-3 rounded bg-slate-800/50 animate-pulse" />
                  </div>
                  <div className="w-12 h-4 rounded bg-slate-800/70 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}