export default function ProfilLoading() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6">
            <div className="w-32 h-7 rounded-lg bg-slate-800/70 animate-pulse mb-2" />
            <div className="w-40 h-3 rounded bg-slate-800/50 animate-pulse" />
          </header>

          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 mb-4 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-800/70 animate-pulse" />
            <div className="flex-1">
              <div className="w-24 h-3 rounded bg-slate-800/50 animate-pulse mb-2" />
              <div className="w-48 h-5 rounded bg-slate-800/70 animate-pulse mb-2" />
              <div className="w-32 h-3 rounded bg-slate-800/50 animate-pulse" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 mb-4">
            <div className="w-28 h-4 rounded bg-slate-800/70 animate-pulse mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800/70 animate-pulse" />
                <div className="flex-1">
                  <div className="w-20 h-3 rounded bg-slate-800/50 animate-pulse mb-1" />
                  <div className="w-40 h-4 rounded bg-slate-800/70 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}