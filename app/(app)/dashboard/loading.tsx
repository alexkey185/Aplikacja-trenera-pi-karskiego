export default function DashboardLoading() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="max-w-2xl mx-auto">
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

          <div className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800/70 animate-pulse" />
            <div className="text-center">
              <div className="w-32 h-6 rounded-lg bg-slate-800/70 animate-pulse mb-2 mx-auto" />
              <div className="w-20 h-3 rounded bg-slate-800/50 animate-pulse mx-auto" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800/70 animate-pulse" />
          </div>
        </header>

        {/* Tydzień (7 dni zamiast miesiąca) */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 mb-5">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="min-h-[180px] rounded-2xl bg-slate-800/40 animate-pulse" style={{ animationDelay: `${(i % 7) * 50}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}