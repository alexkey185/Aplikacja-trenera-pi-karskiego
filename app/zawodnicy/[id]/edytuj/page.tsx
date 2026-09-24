import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { aktualizujZawodnika } from './actions';
import { DeleteButton } from './DeleteButton';

export default async function EdytujZawodnika({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const idNum = parseInt(id, 10);

  if (isNaN(idNum)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: zawodnik, error } = await supabase
    .from('zawodnicy')
    .select('*')
    .eq('id', idNum)
    .single();

  if (error || !zawodnik) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Wróć
          </Link>
          <h1 className="text-2xl font-bold">
            {zawodnik.imie} {zawodnik.nazwisko}
          </h1>
        </header>

        <form
          action={aktualizujZawodnika.bind(null, idNum)}
          className="space-y-4 bg-slate-800 p-6 rounded-lg"
        >
          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Imię *
            </label>
            <input
              name="imie"
              required
              defaultValue={zawodnik.imie}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Nazwisko *
            </label>
            <input
              name="nazwisko"
              required
              defaultValue={zawodnik.nazwisko}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Rocznik
              </label>
              <input
                name="rocznik"
                type="number"
                defaultValue={zawodnik.rocznik ?? ''}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Numer
              </label>
              <input
                name="numer"
                type="number"
                defaultValue={zawodnik.numer ?? ''}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Pozycja
            </label>
            <select
              name="pozycja"
              defaultValue={zawodnik.pozycja ?? ''}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            >
              <option value="">— wybierz —</option>
              <option value="Bramkarz">Bramkarz</option>
              <option value="Obrońca">Obrońca</option>
              <option value="Pomocnik">Pomocnik</option>
              <option value="Napastnik">Napastnik</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Kontakt do rodzica
            </label>
            <input
              name="kontakt_rodzica"
              defaultValue={zawodnik.kontakt_rodzica ?? ''}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Notatki
            </label>
            <textarea
              name="notatki"
              rows={3}
              defaultValue={zawodnik.notatki ?? ''}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-3 rounded-lg"
            >
              Zapisz zmiany
            </button>

            <DeleteButton id={idNum} />
          </div>
        </form>
      </div>
    </main>
  );
}