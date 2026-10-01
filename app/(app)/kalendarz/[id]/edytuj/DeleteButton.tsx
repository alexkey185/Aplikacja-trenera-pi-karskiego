'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { usunTreningZakres } from './actions';
import { Trash2, Calendar, Repeat } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function DeleteButton({
  id,
  cyklId,
}: {
  id: number;
  cyklId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<'single' | 'all'>('single');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isCyclic = !!cyklId;

  const handleDelete = () => {
    const finalScope = isCyclic ? scope : 'single';
    setOpen(false);
    startTransition(async () => {
      const result = await usunTreningZakres(id, finalScope);

      if ('error' in result) {
        toast.error('Nie udało się usunąć', {
          description: result.error,
        });
        return;
      }

      // ═══════════════════════════════════════════════════
      // TOAST — zależnie od tego co usunięto
      // ═══════════════════════════════════════════════════
      if (finalScope === 'all' && result.count > 1) {
        toast.success('Cała seria usunięta', {
          description: `Usunięto ${result.count} treningów z cyklu`,
        });
      } else {
        toast.success('Trening usunięty');
      }

      router.push('/kalendarz');
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="group flex items-center justify-center gap-2 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-0.5 border border-white/20 disabled:opacity-70 disabled:cursor-wait"
      >
        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        {isPending ? 'Usuwanie...' : 'Usuń'}
      </button>

      <ConfirmDialog
        open={open}
        title={isCyclic ? 'Usunąć z serii?' : 'Usunąć to wydarzenie?'}
        variant="danger"
        confirmLabel={isPending ? 'Usuwanie...' : scope === 'all' && isCyclic ? 'Usuń serię' : 'Usuń'}
        cancelLabel="Anuluj"
        loading={isPending}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
        message={
          isCyclic ? (
            <div className="space-y-3">
              <p className="text-sm">
                Ten trening jest częścią <span className="font-bold text-white">cyklu</span>. Co chcesz usunąć?
              </p>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setScope('single')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scope === 'single'
                      ? 'bg-blue-500/15 border-blue-400/60 ring-1 ring-blue-400/30'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <div className="text-xs font-bold text-white">Tylko ten dzień</div>
                  </div>
                  <div className="text-[10px] text-white/60 leading-tight">
                    Usuwa wybrany trening
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scope === 'all'
                      ? 'bg-purple-500/15 border-purple-400/60 ring-1 ring-purple-400/30'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Repeat className="w-3.5 h-3.5 text-purple-400" />
                    <div className="text-xs font-bold text-white">Cała seria</div>
                  </div>
                  <div className="text-[10px] text-white/60 leading-tight">
                    Usuwa wszystkie z cyklu
                  </div>
                </button>
              </div>

              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-2 text-xs text-red-200">
                ⚠️ Zostaną usunięte też wpisy obecności.{' '}
                <strong>Tej operacji nie można cofnąć.</strong>
              </div>
            </div>
          ) : (
            <>
              Usuną się też wszystkie wpisy obecności dla tego treningu.
              <br />
              <br />
              <span style={{ color: '#f87171' }}>Tej operacji nie można cofnąć.</span>
            </>
          )
        }
      />
    </>
  );
}