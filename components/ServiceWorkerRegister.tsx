'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export function ServiceWorkerRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // ═══════════════════════════════════════════════════════
    // W trybie dev: wyrejestruj SW (cache psuje HMR)
    // ═══════════════════════════════════════════════════════
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          reg.unregister();
          console.log('✓ Service Worker wyrejestrowany (tryb dev)');
        });
      });
      return;
    }

    let cancelled = false;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        if (cancelled) return;
        console.log('✓ Service Worker zarejestrowany:', reg.scope);

        // ── Jeśli jest już waiting worker (z poprzedniej sesji) ──
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
        }

        // ── Nasłuchuj nowych wersji ──
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            // „installed" + istniejący kontroler = nowa wersja gotowa
            // (gdy nie ma kontrolera = pierwszy install, nie pokazuj)
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(newWorker);
            }
          });
        });

        // ── Auto-check co godzinę (dla długo otwartych kart) ──
        setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 60 * 1000);
      } catch (err) {
        console.warn('✗ Rejestracja SW nieudana:', err);
      }
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }

    // ── Nasłuchuj przejęcia kontroli → reload z nowym SW ──
    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange
      );
    };
  }, []);

  // ═══════════════════════════════════════════════════════
  // Nowa wersja gotowa → toast z przyciskiem „Odśwież"
  // duration: Infinity → zostaje do kliknięcia
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!waitingWorker) return;

    const toastId = toast.info('Dostępna nowa wersja', {
      description: 'Odśwież, żeby zobaczyć najnowsze zmiany.',
      duration: Infinity,
      action: {
        label: 'Odśwież',
        onClick: () => {
          // Wyślij SW sygnał: aktywuj się od razu
          waitingWorker.postMessage({ type: 'SKIP_WAITING' });
          // controllerchange wymusi reload
          toast.dismiss(toastId);
        },
      },
      icon: <RefreshCw className="w-4 h-4" />,
    });

    return () => {
      toast.dismiss(toastId);
    };
  }, [waitingWorker]);

  return null;
}