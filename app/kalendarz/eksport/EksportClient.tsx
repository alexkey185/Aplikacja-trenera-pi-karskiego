'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

const pad2 = (n: number) => String(n).padStart(2, '0');

type Trening = {
  id: number;
  data: string;
  godzina: string;
  typ: string;
  przeciwnik: string | null;
  miejsce: string | null;
  notatki: string | null;
};

type Dzien = {
  iso: string;
  data: Date;
  events: Trening[];
};

const DAYS_LONG = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
];

const TYP_LABEL: Record<string, string> = {
  trening: 'Trening',
  mecz: 'Mecz',
  sparing: 'Sparing',
  turniej: 'Turniej',
};

export function EksportClient({
  dni,
  stats,
  zakres,
  dataGen,
}: {
  dni: Dzien[];
  stats: { treningi: number; mecze: number; sparingi: number; turnieje: number };
  zakres: string;
  dataGen: string;
  poniedzialek: string;
  niedziela: string;
  email: string;
}) {
  const [mounted, setMounted] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // Tryb eksportu: dodaj klasę do body. Ukrywanie reszty shellu
  // robi CSS (`body.eksport-mode > *:not(.eksport-shell)`) —
  // zero iteracji po DOM, zero getComputedStyle, zero wymuszania
  // layoutu. Oszczędność ~100-500 ms na mobile.
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    setMounted(true);
    document.body.classList.add('eksport-mode');

    return () => {
      document.body.classList.remove('eksport-mode');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) return null;

  const content = (
    <main className="eksport-shell">
      {/* Pasek narzędzi - NIE drukuje się. Padding-top uwzględnia safe area iOS */}
      <div
        className="no-print eksport-toolbar"
        style={{
          padding: '16px',
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <Link
            href="/kalendarz"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            Wróć do kalendarza
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white text-sm font-bold transition-all shadow-lg shadow-red-500/30 w-full sm:w-auto"
          >
            <Printer className="w-4 h-4 flex-shrink-0" />
            Drukuj / Zapisz PDF
          </button>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-5 text-xs text-white/60">
          <div className="font-bold text-white mb-2">Jak zapisać jako PDF:</div>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Kliknij <strong className="text-white">Drukuj / Zapisz PDF</strong>
            </li>
            <li>
              W oknie druku wybierz <strong className="text-white">Zapisz jako PDF</strong>{' '}
              (Destination: Save as PDF)
            </li>
            <li>
              Format: <strong className="text-white">A4</strong>, orientacja:{' '}
              <strong className="text-white">pionowa</strong>
            </li>
            <li>
              Marginesy: <strong className="text-white">Domyślne</strong> lub{' '}
              <strong className="text-white">Brak</strong>
            </li>
            <li>
              Włącz <strong className="text-white">Grafika tła</strong> (Background graphics)
            </li>
          </ol>
        </div>
      </div>

      {/* A4 - plakat do druku */}
      <div className="a4-page">
        <div className="top-bar" />

        <div style={{ padding: '28px 44px 28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '22px',
              paddingBottom: '20px',
              borderBottom: '2px solid #0f172a',
              marginBottom: '20px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#dc2626',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '5px',
                }}
              >
                Plan tygodnia
              </div>
              <h1
                style={{
                  fontSize: '34px',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: '#0f172a',
                  margin: 0,
                }}
              >
                Talent
              </h1>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '4px',
                }}
              >
                Zakres dat
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {zakres.split(' — ')[0]}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#dc2626',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  marginTop: '2px',
                }}
              >
                — {zakres.split(' — ')[1]}
              </div>
            </div>
          </div>

          {dni.map((d) => {
            const dzienTyg = DAYS_LONG[d.data.getDay()];
            const dataStr = `${pad2(d.data.getDate())}.${pad2(d.data.getMonth() + 1)}`;
            const maEvent = d.events.length > 0;

            if (!maEvent) {
              return (
                <div key={d.iso} className="day-off">
                  <div>
                    <div className="day-name">{dzienTyg}</div>
                    <div className="day-date">{dataStr}</div>
                  </div>
                  <div className="off-label">Wolne</div>
                </div>
              );
            }

            return (
              <div key={d.iso}>
                {d.events.map((event, idx) => (
                  <div
                    key={event.id}
                    className="day-block"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(220,38,38,0.06) 0%, transparent 100%)',
                      margin: '0 -16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      borderRadius: '12px',
                      borderBottom:
                        idx === d.events.length - 1 ? '1px solid #e2e8f0' : 'none',
                    }}
                  >
                    <div>
                      <div className="day-name">{idx === 0 ? dzienTyg : ''}</div>
                      <div className="day-date">{idx === 0 ? dataStr : ''}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                      <div>
                        <div className="event-time">{event.godzina}</div>
                      </div>

                      <div style={{ width: '1px', height: '44px', background: '#e2e8f0' }} />

                      <div style={{ flex: 1 }}>
                        <div className="event-type">
                          {TYP_LABEL[event.typ] ?? event.typ}
                          {event.przeciwnik && ` vs ${event.przeciwnik}`}
                        </div>
                        <div className="event-place">
                          {event.miejsce ?? 'Miejsce do potwierdzenia'}
                        </div>
                      </div>

                      <div
                        style={{
                          width: '10px',
                          height: '44px',
                          borderRadius: '5px',
                          background: '#dc2626',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {stats.treningi + stats.mecze + stats.sparingi + stats.turnieje > 0 && (
            <div
              style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
              }}
            >
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
                  {stats.treningi}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginTop: '2px' }}>
                  Treningi
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
                  {stats.mecze}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginTop: '2px' }}>
                  Mecze
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
                  {stats.sparingi}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginTop: '2px' }}>
                  Sparingi
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
                  {stats.turnieje}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginTop: '2px' }}>
                  Turnieje
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              color: '#94a3b8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Wygenerowano w</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    background: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: 'white', fontWeight: 900, fontSize: '9px' }}>t</span>
                </div>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11px' }}>talent.</span>
              </div>
              <span>· {dataGen}</span>
            </div>
            <div>Strona 1 / 1</div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        main.eksport-shell {
          position: fixed !important;
          inset: 0 !important;
          z-index: 99999 !important;
          background: #0a0e1a !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          -webkit-overflow-scrolling: touch;
          /* Safe area dla iOS PWA - iPhone z dynamic island */
          padding-top: env(safe-area-inset-top, 0);
        }

        /* Dodatkowo chroni toolbar przed status barem na iOS */
        .eksport-toolbar {
          padding-top: max(16px, env(safe-area-inset-top, 16px)) !important;
        }

        .no-print {
          display: block;
        }

        .a4-page {
          width: 210mm;
          height: 297mm;
          margin: 0 auto 40px;
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.6);
          position: relative;
          overflow: hidden;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .top-bar {
          height: 6px;
          background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
        }

        .day-block {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 22px;
          align-items: center;
          padding: 18px 0;
        }

        .day-name {
          font-size: 34px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #0f172a;
        }

        .day-date {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          margin-top: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .event-time {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
          color: #0f172a;
        }

        .event-type {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 4px;
        }

        .event-place {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .day-off {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 22px;
          align-items: center;
          padding: 8px 0;
        }

        .day-off .day-name {
          font-size: 22px;
          color: #cbd5e1;
        }

        .day-off .day-date {
          color: #e2e8f0;
        }

        .day-off .off-label {
          font-size: 12px;
          color: #cbd5e1;
          font-style: italic;
        }

        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html,
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          body.eksport-mode {
            overflow: visible !important;
          }

          body * {
            visibility: hidden !important;
          }

          main.eksport-shell,
          main.eksport-shell * {
            visibility: visible !important;
          }

          main.eksport-shell {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            z-index: auto !important;
            padding-top: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .a4-page {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: avoid;
            page-break-inside: avoid;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </main>
  );

  return createPortal(content, document.body);
}