import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';

// Komponent pobierający dane z Supabase
async function ZawodnicyList() {
  const supabase = await createClient();
  const { data: zawodnicy, error } = await supabase
    .from('zawodnicy')
    .select('*')
    .order('nazwisko', { ascending: true });

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-sm">
        Błąd: {error.message}
      </div>
    );
  }

  if (!zawodnicy || zawodnicy.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center text-slate-400">
        Brak zawodników w bazie.
        <br />
        Dodaj pierwszego w panelu Supabase → Table Editor → zawodnicy → Insert.
      </div>
    );
  }

  return (
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
  <Link
    href={`/zawodnicy/${z.id}/edytuj`}
    className="text-slate-400 hover:text-white text-sm px-3 py-1 border border-slate-700 rounded-lg transition-colors"
  >
    Edytuj
  </Link>
</li>
      ))}
    </ul>
  );
}

// Komponent zastępczy — pokazuje się, zanim dane się załadują
function Ladowanie() {
  return (
    <div className="bg-slate-800 rounded-lg p-6 text-center text-slate-400">
      Ładowanie listy zawodników…
    </div>
  );
}

// Główna strona
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
       <header className="mb-8 flex items-center justify-between">
  <h1 className="text-3xl font-bold">⚽ Moja Kadra</h1>
  <Link
    href="/zawodnicy/nowy"
    className="bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold px-4 py-2 rounded-lg text-sm"
  >
    + Dodaj zawodnika
  </Link>
</header>

        <Suspense fallback={<Ladowanie />}>
          <ZawodnicyList />
        </Suspense>
      </div>
    </main>
  );
}