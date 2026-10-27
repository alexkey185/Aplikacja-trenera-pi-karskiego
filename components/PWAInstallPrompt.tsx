'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa_install_dismissed_at';
const VISITS_KEY = 'pwa_visit_count';
const VISITS_BEFORE_PROMPT = 2;
const DISMISS_COOLDOWN_DAYS = 30;

function getVisitCount(): number {
  try {
    return parseInt(localStorage.getItem(VISITS_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function isDismissedRecently(): boolean {
  try {
    const at = localStorage.getItem(DISMISS_KEY);
    if (!at) return false;
    const days = (Date.now() - parseInt(at, 10)) / (1000 * 60 * 60 * 24);
    return days < DISMISS_COOLDOWN_DAYS;
  } catch {
    return false;
  }
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return (
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (isStandaloneMode()) return;
    if (isDismissedRecently()) return;

    const visits = getVisitCount() + 1;
    try {
      localStorage.setItem(VISITS_KEY, String(visits));
    } catch {}

    if (visits < VISITS_BEFORE_PROMPT) return;

    if (isIOS()) {
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      setVisible(false);
      try {
        localStorage.removeItem(DISMISS_KEY);
      } catch {}
    };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS()) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    } else {
      handleDismiss();
    }
    setDeferredPrompt(null);
  }, [deferredPrompt, handleDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed z-40 bottom-24 left-4 right-20 md:bottom-6 md:left-[16.5rem] md:right-auto md:w-80 animate-fadeIn">
      <div className="relative bg-slate-900/95 backdrop-blur-xl border border-green-400/40 rounded-2xl p-4 shadow-2xl shadow-black/60">
        <button
          onClick={handleDismiss}
          aria-label="Zamknij"
          className="absolute top-2 right-2 w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {!showIOSInstructions ? (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
              <Download className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0 pr-5">
              <div className="font-bold text-white text-sm">Zainstaluj Talent</div>
              <div className="text-xs text-white/60 mt-1 leading-relaxed">
                Szybki dostęp z ekranu głównego. Działa jak natywna aplikacja.
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold text-xs py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/40"
                >
                  Zainstaluj
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold py-2 rounded-lg transition-all"
                >
                  Nie teraz
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="font-bold text-white text-sm mb-3 pr-5">
              Zainstaluj na iPhone
            </div>
            <ol className="space-y-2.5 text-xs text-white/70">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  1
                </span>
                <span>
                  Kliknij{' '}
                  <Share className="w-3.5 h-3.5 inline text-green-400 mx-0.5" />{' '}
                  <strong className="text-white">Udostępnij</strong> na dole Safari
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  2
                </span>
                <span>
                  Wybierz <Plus className="w-3.5 h-3.5 inline text-green-400 mx-0.5" />{' '}
                  <strong className="text-white">Dodaj do ekranu początkowego</strong>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  3
                </span>
                <span>
                  Kliknij <strong className="text-white">Dodaj</strong> w prawym górnym rogu
                </span>
              </li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold py-2 rounded-lg transition-all"
            >
              Rozumiem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}