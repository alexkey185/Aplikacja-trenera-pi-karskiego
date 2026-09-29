import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { aktualizujZawodnika } from './actions';
import { DeleteButton } from './DeleteButton';
import { ArrowLeft, User, Hash, Trophy, Phone, FileText, Save, Pencil } from 'lucide-react';

export default async function EdytujZawodnika({ params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) notFound();

  const supabase = await createClient();
  const { data: zawodnik, error } = await supabase.from('zawodnicy').select('*').eq('id', idNum).single();
  if (error || !zawodnik) notFound();

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 md:hidden">
        <Image src="/talent-bg-mobile.webp" alt="" fill  quality={75} sizes="100vw" className="object-cover object-center" aria-hidden />
      </div>
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image src="/talent-bg.webp" alt="" fill  quality={75} sizes="100vw" className="object-cover object-center" aria-hidden />
      </div>
      <div className="fixed inset-0 z-10 bg-slate-950/70 backdrop-blur-sm" />

      <div className="relative z-20 p-4 md:p-6 pb-28">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 flex items-center gap-3 animate-fadeIn">
            <Link href={`/zawodnicy/${idNum}`} className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                  <Pencil className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight text-white drop-shadow-lg">Edytuj zawodnika</h1>
                <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">{zawodnik.imie} {zawodnik.nazwisko}</p>
              </div>
            </div>
          </header>

          <form action={aktualizujZawodnika.bind(null, idNum)} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field icon={User} label="Imię" required>
                <input name="imie" required defaultValue={zawodnik.imie} className="w-full bg-transparent border-0 outline-none text-white py-2" />
              </Field>
              <Field icon={User} label="Nazwisko" required>
                <input name="nazwisko" required defaultValue={zawodnik.nazwisko} className="w-full bg-transparent border-0 outline-none text-white py-2" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field icon={Trophy} label="Rocznik">
                <input name="rocznik" type="number" defaultValue={zawodnik.rocznik ?? ''} className="w-full bg-transparent border-0 outline-none text-white py-2" />
              </Field>
              <Field icon={Hash} label="Numer">
                <input name="numer" type="number" defaultValue={zawodnik.numer ?? ''} className="w-full bg-transparent border-0 outline-none text-white py-2" />
              </Field>
            </div>

            <Field icon={Trophy} label="Pozycja">
              <select name="pozycja" defaultValue={zawodnik.pozycja ?? ''} className="w-full bg-transparent border-0 outline-none text-white py-2 [&>option]:bg-slate-800">
                <option value="">— wybierz —</option>
                <option value="Bramkarz">🧤 Bramkarz</option>
                <option value="Obrońca">🛡️ Obrońca</option>
                <option value="Pomocnik">⚙️ Pomocnik</option>
                <option value="Napastnik">⚡ Napastnik</option>
              </select>
            </Field>

            <Field icon={Phone} label="Kontakt do rodzica">
              <input name="kontakt_rodzica" type="tel" defaultValue={zawodnik.kontakt_rodzica ?? ''} className="w-full bg-transparent border-0 outline-none text-white py-2" />
            </Field>

            <Field icon={FileText} label="Notatki">
              <textarea name="notatki" rows={3} defaultValue={zawodnik.notatki ?? ''} className="w-full bg-transparent border-0 outline-none text-white py-2 resize-none" />
            </Field>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5">
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Zapisz zmiany
              </button>
              <DeleteButton id={idNum} />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({ icon: Icon, label, required, children }: { icon: any; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block group">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-white/50 group-focus-within:text-green-400 transition-colors" />
        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
          {label}
          {required && <span className="text-green-400 ml-1">*</span>}
        </span>
      </div>
      <div className="bg-white/5 border border-white/15 focus-within:border-green-400/60 focus-within:bg-white/10 rounded-xl px-3 transition-all">
        {children}
      </div>
    </label>
  );
}