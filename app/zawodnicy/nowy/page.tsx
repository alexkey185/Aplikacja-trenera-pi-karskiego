import Link from 'next/link';
import { dodajZawodnika } from './actions';

export default function NowyZawodnik() {
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
          <h1 className="text-2xl font-bold">Nowy zawodnik</h1>
        </header>

        <form
          action={dodajZawodnika}
          className="space-y-4 bg-slate-800 p-6 rounded-lg"
        >
          <div>
            <label className="block text-sm mb-1 text-slate-300">
              Imię *
            </label>
            <input
              name="imie"
              required
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
                placeholder="np. 2012"
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
                placeholder="np. 7"
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
              placeholder="np. 600 100 200"
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
              placeholder="np. Dobra gra lewą nogą"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-3 rounded-lg"
          >
            Zapisz zawodnika
          </button>
        </form>
      </div>
    </main>
  );
}