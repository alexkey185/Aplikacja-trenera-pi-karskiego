'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, Calendar, Repeat } from 'lucide-react';
import { usunTreningZakres } from './[id]/edytuj/actions';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function DeleteEventButton({
  id,
  cyklId,
  size = 'sm',
  variant = 'icon',
}: {
  id: number;
  cyklId?: string | null;
  size?: 'sm' | 'md';
  variant?: 'icon' | 'tile';
}) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<'single' | 'all'>('single');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isCyclic = !!cyklId;

  const btnClass =
    variant === 'tile'
      ? 'inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-400/40 text-white/70 hover:text-red-300 text-xs font-semibold transition-all disabled:opacity-50'
      : size === 'md'
      ? 'w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/40 flex items-center justify-center text-white/40 hover:text-red-400 transition-all disabled:opacity-50'
      : 'w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/40 flex items-center justify-center text-white/40 hover:text-red-400 transition-all disabled:opacity-50';

  const iconClass =
    variant === 'tile' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

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

      if (finalScope === 'all' && result.count > 1) {
        toast.success('Cała seria usunięta', {
          description: `Usunięto ${result.count} treningów z cyklu`,
        });
      } else {
        toast.success('Trening usunięty');
      }

      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        disabled={isPending}
        className={btnClass}
        title="Usuń wydarzenie"
        aria-label="Usuń wydarzenie"
      >
        <Trash2 className={iconClass} />
        {variant === 'tile' && <span className="hidden md:inline">Usuń</span>}
      </button>

      <ConfirmDialog
        open={open}
        title={isCyclic ? 'Usunąć z serii?' : 'Usunąć to wydarzenie?'}
        variant="danger"
        confirmLabel={
          isPending ? 'Usuwanie...' : isCyclic && scope === 'all' ? 'Usuń serię' : 'Usuń'
        }
        loading={isPending}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
        message={
          isCyclic ? (
            <div className="space-y-3">
              <p className="text-sm">
                Ten trening jest częścią <span className="font-bold text-white">cyklu</span>. Co
                chcesz usunąć?
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