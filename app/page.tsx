import { createClient } from '@/lib/supabase/server';

export default async function Home() {

  const supabase = await createClient();
  const { data: zawodnicy, error } = await supabase
    .from('zawodnicy')
    .select('*')
    .order('nazwisko', { ascending: true });

  if (error) {
    console.error('Błąd pobierania zawodników:', error);
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">⚽ Moja Kadra</h1>
          <p className="text-slate-400 text-sm mt-1">
            {zawodnicy?.length ?? 0} zawodników w bazie
          </p>
        </header>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 mb-4 text-sm">
            Błąd: {error.message}
          </div>
        )}

        {!zawodnicy || zawodnicy.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-6 text-center text-slate-400">
            Brak zawodników w bazie.
            <br />
            Dodaj pierwszego w panelu Supabase → Table Editor → zawodnicy → Insert.
          </div>
        ) : (
          <ul className="space-y-3">
            {zawodnicy.map((z: any) => (
              <li
                key={z.id}
                className="bg-slate-800 rounded-lg p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold">
                  {z.numer ?? '—'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">
                    {z.imie} {z.nazwisko}
                  </div>
                  <div className="text-sm text-slate-400">
                    {z.pozycja ?? 'Brak pozycji'} · {z.rocznik ?? '—'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}