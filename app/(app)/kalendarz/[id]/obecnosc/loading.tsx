export default function ObecnoscLoading() {
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
                <div className="w-28 h-6 rounded-lg bg-slate-800/70 animate-pulse mb-1" />
                <div className="w-40 h-3 rounded bg-slate-800/50 animate-pulse" />
              </div>
            </div>
          </header>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 mb-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="w-32 h-4 rounded bg-slate-800/70 animate-pulse" />
              <div className="w-16 h-4 rounded bg-slate-800/70 animate-pulse" />
              <div className="w-40 h-4 rounded bg-slate-800/70 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 flex items-center gap-3"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-slate-800/70 animate-pulse" />
                <div className="flex-1">
                  <div className="w-2/3 h-4 rounded bg-slate-800/70 animate-pulse mb-1" />
                  <div className="w-1/3 h-3 rounded bg-slate-800/50 animate-pulse" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 animate-pulse" />
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}