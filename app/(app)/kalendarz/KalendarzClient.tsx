> Build error occurred
Error: Turbopack build failed with 1 error:
./app/(app)/kalendarz/KalendarzClient.tsx:503:68
Error: Expected '</', got '<eof>'
  501 |                   className={`p-3 rounded-xl border text-left transition-all ${
  502 |                     scope === 'all'
> 503 | ? 'bg-purple-500/15 border-purple-400/60 ring-1 ring-purple-400/30'
      |                                                                    ^
Parsing ecmascript source code failed
Import trace:
  Server Component:
    ./app/(app)/kalendarz/KalendarzClient.tsx
    ./app/(app)/kalendarz/page.tsx
    at <unknown> (./app/(app)/kalendarz/KalendarzClient.tsx:503:68)
Error: [BUILD_UTILS_SPAWN_1] Command "next build" exited with 1