'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { aktualizujDruzyna, usunDruzyna } from './actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Users, Hash, Palette, Save, Check, Trash2, AlertTriangle, X } from 'lucide-react';

const KOLORY = [
  { value: 'green', bg: 'bg-green-500', ring: 'peer-checked:ring-green-400' },
  { value: 'blue', bg: 'bg-blue-500', ring: 'peer-checked:ring-blue-400' },
  { value: 'purple', bg: 'bg-purple-500', ring: 'peer-checked:ring-purple-400' },
  { value: 'orange', bg: 'bg-orange-500', ring: 'peer-checked:ring-orange-400' },
  { value: 'red', bg: 'bg-red-500', ring: 'peer-checked:ring-red-400' },
  { value: 'yellow', bg: 'bg-yellow-500', ring: 'peer-checked:ring-yellow-400' },
  { value: 'pink', bg: 'bg-pink-500', ring: 'peer-checked:ring-pink-400' },
  { value: 'slate', bg: 'bg-slate-500', ring: 'peer-checked:ring-slate-400' },
];

type Druzyna = {
  id: string;
  nazwa: string;
  rocznik: number | null;
  kolor: string;
};

export function EdytujDruzynaForm({
  druzyna,
  liczbaZawodnikow,
  liczbaTreningow,
}: {
  druzyna: Druzyna;
  liczbaZawodnikow: number;
  liczbaTreningow: number;
}) {
  const [openDelete, setOpenDelete] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const maDane = liczbaZawodnikow > 0 || liczbaTreningow > 0;

  return (
    <>
      <form
        action={aktualizujDruzyna.bind(null, druzyna.id)}
        className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl shadow-black/60 mb-4"
      >
        <label className="block group">
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="w-3.5 h-3.5 text-white/50 group-focus-within:text-green-400 transition-colors" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Nazwa drużyny <span className="text-green-400 ml-1">*</span>
            </span>
          </div>
          <div className="bg-white/5 border border-white/15 focus-within:border-green-400/60 focus-within:bg-white/10 rounded-xl px-3 transition-all">
            <input
              name="nazwa"
              type="text"
              required
              maxLength={80}
              defaultValue={druzyna.nazwa}
              className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2"
            />
          </div>
        </label>

        <label className="block group">
          <div className="flex items-center gap-2 mb-1.5">
            <Hash className="w-3.5 h-3.5 text-white/50 group-focus-within:text-green-400 transition-colors" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Rocznik
            </span>
          </div>
          <div className="bg-white/5 border border-white/15 focus-within:border-green-400/60 focus-within:bg-white/10 rounded-xl px-3 transition-all">
            <input
              name="rocznik"
              type="number"
              min={1900}
              max={2100}
              defaultValue={druzyna.rocznik ?? ''}
              placeholder="np. 2012"
              className="w-full bg-transparent border-0 outline-none text-white placeholder:text-white/40 py-2"
            />
          </div>
        </label>

        <fieldset>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Kolor drużyny
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {KOLORY.map((k) => (
              <label key={k.value} className="cursor-pointer" title={k.value}>
                <input
                  type="radio"
                  name="kolor"
                  value={k.value}
                  defaultChecked={druzyna.kolor === k.value}
                  className="peer sr-only"
                />
                <div
                  className={`relative w-10 h-10 rounded-xl ${k.bg} transition-all peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-slate-900 ${k.ring} hover:scale-105 flex items-center justify-center`}
                >
                  <Check
                    className="w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    strokeWidth={3}
                  />
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2 pt-2">
          <Link
            href="/druzyny"
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold py-3.5 rounded-2xl transition-all text-sm md:text-base"
          >
            <X className="w-4 h-4 flex-shrink-0" />
            Anuluj
          </Link>
          <button
            type="submit"
            className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 text-sm md:text-base"
          >
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span>
              Zapisz<span className="hidden sm:inline"> zmiany</span>
            </span>
          </button>
        </div>
      </form>

      {/* Strefa niebezpieczna - chroniona po stronie serwera, ale dla pewności ukrywamy przycisk */}
      <div className="bg-red-500/[0.03] backdrop-blur-md border border-red-400/20 rounded-3xl p-5 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-bold text-red-400/90 uppercase tracking-widest">
            Strefa niebezpieczna
          </h3>
        </div>
        <p className="text-xs text-white/50 mb-4 leading-relaxed">
          Usunięcie drużyny jest nieodwracalne. Kaskadowo usunie wszystkich jej zawodników,
          treningi i wpisy obecności.
        </p>
        <button
          type="button"
          onClick={() => setOpenDelete(true)}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 font-semibold py-3.5 rounded-2xl text-sm transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Usuń drużynę
        </button>
      </div>

      <form ref={deleteFormRef} action={usunDruzyna} className="hidden">
        <input type="hidden" name="id" value={druzyna.id} />
      </form>

      <ConfirmDialog
        open={openDelete}
        title="Usunąć drużynę?"
        variant="danger"
        confirmLabel="Usuń trwale"
        cancelLabel="Anuluj"
        message={
          <div className="space-y-3">
            <p className="text-sm">
              Drużyna <strong className="text-white">{druzyna.nazwa}</strong> zostanie usunięta nieodwracalnie.
            </p>
            {maDane && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 text-xs space-y-1">
                <div className="text-red-300 font-bold uppercase tracking-wider text-[10px]">
                  Zostaną usunięte:
                </div>
                {liczbaZawodnikow > 0 && (
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-red-400 font-bold">•</span>
                    <span>
                      <strong className="text-red-300">{liczbaZawodnikow}</strong>{' '}
                      {liczbaZawodnikow === 1 ? 'zawodnik' : 'zawodników'}{' '}
                      z całą historią obecności
                    </span>
                  </div>
                )}
                {liczbaTreningow > 0 && (
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-red-400 font-bold">•</span>
                    <span>
                      <strong className="text-red-300">{liczbaTreningow}</strong>{' '}
                      {liczbaTreningow === 1 ? 'trening' : 'treningów'} i mecze
                    </span>
                  </div>
                )}
              </div>
            )}
            <p className="text-red-400 font-bold text-sm">
              Tej operacji nie można cofnąć.
            </p>
          </div>
        }
        onCancel={() => setOpenDelete(false)}
        onConfirm={() => {
          deleteFormRef.current?.requestSubmit();
          setOpenDelete(false);
        }}
      />
    </>
  );
}