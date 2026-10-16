'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './landing.module.css';

type Player = {
  name: string;
  ini: string;
  meta: string;
  days: number[];
};

const INITIAL_PLAYERS: Player[] = [
  { name: 'Antoni Adamski', ini: 'AA', meta: '2018 · Pomocnik', days: [1, 1, 0, 1, 1] },
  { name: 'Bruno Bielski', ini: 'BB', meta: '2020 · Napastnik', days: [1, 0, 1, 1, 1] },
  { name: 'Czarek Cichy', ini: 'CC', meta: '2020 · Pomocnik', days: [0, 0, 1, 0, 1] },
  { name: 'Dawid Dąbrowski', ini: 'DD', meta: '2021 · Bramkarz', days: [1, 1, 1, 1, 1] },
  { name: 'Filip Fijał', ini: 'FF', meta: '2020 · Napastnik', days: [1, 1, 0, 1, 1] },
];

const MARQUEE = ['KADRA', 'KALENDARZ', 'FREKWENCJA', 'STATYSTYKI', 'EKSPORT PDF', 'TELEFON I KOMPUTER'];

type FeatureIcon = 'users' | 'calendar' | 'dots' | 'chart' | 'file' | 'phone';

const FEATURES: { icon: FeatureIcon; title: string; desc: string }[] = [
  { icon: 'users', title: 'Kadra', desc: 'Lista zawodników z rocznikiem, pozycją i numerem. Szukaj, sortuj, miej wszystko pod ręką.' },
  { icon: 'calendar', title: 'Kalendarz', desc: 'Treningi, mecze, sparingi i turnieje w jednym kalendarzu, każde w swoim kolorze.' },
  { icon: 'dots', title: 'Frekwencja na pierwszy rzut oka', desc: 'Przy każdym zawodniku widzisz kropki z ostatnich treningów i od razu wiesz, kto przestał przychodzić.' },
  { icon: 'chart', title: 'Statystyki', desc: 'Średnia frekwencja, wykres miesięczny, ranking obecności i lista zawodników do poprawy.' },
  { icon: 'file', title: 'Eksport do PDF', desc: 'Wydrukuj kalendarz albo wyślij go dalej, kiedy potrzebujesz wersji na papierze.' },
  { icon: 'phone', title: 'Telefon i komputer', desc: 'Działa w przeglądarce i można ją dodać do ekranu głównego. Bez instalowania ze sklepu.' },
];

const HINT_INITIAL = { player: 2, dot: 1 };

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61595246542172';
const CONTACT_EMAIL = 'kontakt@talentapp.pl';
const SIGNUP_URL = '/auth/sign-up';

// ── NOWE: wymiary screenshotów (podmień na wynik `identify` po konwersji do WebP) ──
const SHOTS = {
  kadra: { src: '/screenshots/screen1-lista-kadry.webp', w: 1280, h: 800 },
  kalendarzD: { src: '/screenshots/screen2-kalendarz-desktop.webp', w: 1280, h: 800 },
  statystyki: { src: '/screenshots/screen3-statystyki.webp', w: 1280, h: 800 },
  kalendarzM: { src: '/screenshots/screen4-kalendarz-mobile.webp', w: 720, h: 1560 },
} as const;

export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [hint, setHint] = useState<{ player: number; dot: number } | null>(HINT_INITIAL);
  const [displayedPct, setDisplayedPct] = useState(80);
  const pctRef = useRef(80);

  const totalPct = useMemo(() => {
    const on = players.reduce((s, p) => s + p.days.reduce((a, b) => a + b, 0), 0);
    return Math.round((on / (players.length * 5)) * 100);
  }, [players]);

  useEffect(() => {
    let raf = 0;
    const from = pctRef.current;
    const to = totalPct;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 450);
      const v = Math.round(from + (to - from) * k);
      pctRef.current = v;
      setDisplayedPct(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [totalPct]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add(styles.in);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root.querySelectorAll<HTMLElement>(`.${styles.rv}`).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const demo = demoRef.current;
    if (!hero || !demo) return;

    const fine =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) return;

    const onMove = (e: PointerEvent) => {
      const b = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - b.left}px`);
      hero.style.setProperty('--my', `${e.clientY - b.top}px`);
      const c = demo.getBoundingClientRect();
      const dx = (e.clientX - (c.left + c.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (c.top + c.height / 2)) / window.innerHeight;
      demo.style.transform = `rotateY(${dx * 14}deg) rotateX(${-dy * 10}deg)`;
    };
    const onLeave = () => {
      demo.style.transform = '';
    };

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const toggleDot = (pi: number, di: number) => {
    if (hint) setHint(null);
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === pi ? { ...p, days: p.days.map((v, j) => (j === di ? (v ? 0 : 1) : v)) } : p,
      ),
    );
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.intro} aria-hidden="true">
        <div className={styles.lg}>
          talent<span className={styles.bd} />
        </div>
      </div>

      <div className={styles.bar}>
        <div className={styles.wrap}>
          <div className={styles.nav}>
            <a className={styles.logo} href="#">
              talent<span className={styles.dot} />
            </a>
            <a className={`${styles.btn} ${styles.btnP}`} href="#testy">
              Zapisz się na testy
            </a>
          </div>
        </div>

        <div ref={heroRef} className={styles.hw}>
          <svg
            className={styles.pitch}
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            stroke="#22c55e"
            strokeWidth={2}
            aria-hidden="true"
          >
            <rect pathLength={1} x={40} y={40} width={1120} height={620} rx={6} />
            <path pathLength={1} d="M600 40V660" />
            <circle pathLength={1} cx={600} cy={350} r={110} />
            <rect pathLength={1} x={40} y={190} width={170} height={320} />
            <rect pathLength={1} x={990} y={190} width={170} height={320} />
          </svg>

          <div className={styles.wrap}>
            <div className={styles.hero2}>
              <div>
                <div className={`${styles.eyebrow} ${styles.fd}`}>
                  Aplikacja dla trenerów piłki nożnej
                </div>
                <h1 className={styles.h1}>
                  <span className={styles.w} style={{ '--i': 0 } as CSSProperties}>
                    Twoja
                  </span>{' '}
                  <span className={styles.w} style={{ '--i': 1 } as CSSProperties}>
                    drużyna,
                  </span>{' '}
                  <span
                    className={`${styles.w} ${styles.green}`}
                    style={{ '--i': 2 } as CSSProperties}
                  >
                    Twoje
                  </span>{' '}
                  <span
                    className={`${styles.w} ${styles.green}`}
                    style={{ '--i': 3 } as CSSProperties}
                  >
                    zasady.
                  </span>
                </h1>
                <p className={`${styles.lead} ${styles.fd}`}>
                  Obecność i plan treningów w jednym miejscu. Koniec z kartkami, Excelem i szukaniem wiadomości na
                  grupach.
                </p>
                <div className={`${styles.ctas} ${styles.fd}`}>
                  <a className={`${styles.btn} ${styles.btnP}`} href="#testy">
                    Zapisz się na testy
                  </a>
                  <a className={`${styles.btn} ${styles.btnS}`} href="#funkcje">
                    Zobacz, jak to działa
                  </a>
                </div>
              </div>

              <div className={`${styles.demoWrap} ${styles.fd}`}>
                <div ref={demoRef} className={styles.demo}>
                  <div className={styles.dh}>
                    <span>LISTA ZAWODNIKÓW</span>
                    <small>SKRZATY · DEMO</small>
                  </div>

                  <div>
                    {players.map((p, pi) => {
                      const presentCount = p.days.reduce((a, b) => a + b, 0);
                      const warn = presentCount / 5 < 0.7;
                      return (
                        <div key={pi} className={styles.row}>
                          <div className={styles.av}>{p.ini}</div>
                          <div className={styles.nm}>
                            <b>{p.name}</b>
                            <span>{p.meta}</span>
                          </div>
                          <span className={`${styles.warn} ${warn ? styles.show : ''}`}>
                            do poprawy
                          </span>
                          <div className={styles.dots}>
                            {p.days.map((v, di) => {
                              const isHint = !!hint && hint.player === pi && hint.dot === di;
                              return (
                                <button
                                  key={di}
                                  type="button"
                                  className={`${styles.d} ${!v ? styles.off : ''} ${
                                    isHint ? styles.hint : ''
                                  }`}
                                  onClick={() => toggleDot(pi, di)}
                                  aria-label={`${p.name}, trening ${di + 1}: ${
                                    v ? 'obecny' : 'nieobecny'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.df}>
                    <div
                      className={styles.ring}
                      style={{ '--p': displayedPct } as CSSProperties}
                    >
                      <div>{displayedPct}%</div>
                    </div>
                    <p>
                      <b>Frekwencja drużyny.</b>
                      <br />
                      Kliknij kropkę, żeby zmienić obecność i zobaczyć, jak zmienia się wynik. Dane w demo są
                      fikcyjne.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mq} aria-hidden="true">
        <div>
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      <div className={styles.sec}>
        <div className={styles.wrap}>
          <h2 className={`${styles.h2} ${styles.rv}`}>Jak to działa</h2>
          <div className={styles.steps}>
            <Step n="1" title="Dodaj drużynę">
              Wpisz zawodników z rocznikiem, pozycją i numerem.
            </Step>
            <Step n="2" title="Zaplanuj treningi i mecze">
              Wszystko w kalendarzu, każde wydarzenie w swoim kolorze.
            </Step>
            <Step n="3" title="Zaznaczaj obecność">
              Kropki przy zawodnikach i statystyki drużyny liczą się same.
            </Step>
          </div>
        </div>
      </div>

      <div className={styles.sec}>
        <div className={styles.wrap}>
          <div className={styles.split}>
            <div>
              <h2 className={`${styles.h2} ${styles.rv}`}>Cała kadra w jednym miejscu</h2>
              <p className={`${styles.sub} ${styles.rv}`}>
                Imię, rocznik, pozycja i numer — plus kropki z ostatnich treningów obok każdego nazwiska.
                Wiesz, kto przestał przychodzić, zanim zrobi się z tego problem.
              </p>
              <ul className={styles.ticks}>
                <Tick>Szukaj, sortuj i filtruj po pozycji</Tick>
                <Tick>Kontakt do rodzica i notatki trenera przy każdym zawodniku</Tick>
                <Tick>Numery na koszulkach widoczne od razu</Tick>
              </ul>
            </div>
            <div className={`${styles.media} ${styles.shot} ${styles.rv}`}>
              <Image
                src={SHOTS.kadra.src}
                alt="Lista zawodników w aplikacji talent."
                width={SHOTS.kadra.w}
                height={SHOTS.kadra.h}
                sizes="(max-width: 860px) 100vw, 620px"
                quality={75}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sec}>
        <div className={styles.wrap}>
          <div className={`${styles.split} ${styles.rev}`}>
            <div>
              <h2 className={`${styles.h2} ${styles.rv}`}>Plan, który nie ginie w wiadomościach</h2>
              <p className={`${styles.sub} ${styles.rv}`}>
                Treningi, mecze, sparingi i turnieje w jednym kalendarzu. Każdy typ wydarzenia ma swój kolor —
                na pierwszy rzut oka wiesz, co się dzieje.
              </p>
              <ul className={styles.ticks}>
                <Tick>Widok tygodnia i miesiąca, także na telefonie</Tick>
                <Tick>Dodawanie cyklicznych treningów (co tydzień, co 2 tygodnie)</Tick>
                <Tick>Eksport planu tygodnia do PDF</Tick>
              </ul>
            </div>
            <div className={`${styles.media} ${styles.shot} ${styles.rv}`}>
              <Image
                src={SHOTS.kalendarzD.src}
                alt="Kalendarz w aplikacji talent. na komputerze"
                width={SHOTS.kalendarzD.w}
                height={SHOTS.kalendarzD.h}
                sizes="(max-width: 860px) 100vw, 620px"
                quality={75}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sec} id="funkcje">
        <div className={styles.wrap}>
          <h2 className={`${styles.h2} ${styles.rv}`}>
            Wszystko, czego trener potrzebuje na co dzień
          </h2>
          <p className={`${styles.sub} ${styles.rv}`}>
            Tylko to, co naprawdę przydaje się przy prowadzeniu drużyny dzieci i młodzieży.
          </p>
          <div className={styles.grid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={`${styles.card} ${styles.rv}`}>
                <div className={styles.ico}>
                  <FeatureIcon kind={f.icon} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sec}>
        <div className={styles.wrap}>
          <div className={styles.split}>
            <div>
              <h2 className={`${styles.h2} ${styles.rv}`}>Frekwencja bez liczenia</h2>
              <p className={`${styles.sub} ${styles.rv}`}>
                Zamiast przeglądać kartki, wybierasz okres i widzisz obraz drużyny.
              </p>
              <ul className={styles.ticks}>
                <Tick>Okres do wyboru: 30 dni, 3 miesiące, sezon albo cały okres</Tick>
                <Tick>Wykres miesiąc po miesiącu pokazuje trend</Tick>
                <Tick>Ranking obecności i lista zawodników z frekwencją poniżej 70%</Tick>
              </ul>
            </div>
            <div className={`${styles.media} ${styles.shot} ${styles.rv}`}>
              <Image
                src={SHOTS.statystyki.src}
                alt="Widok statystyk frekwencji drużyny w aplikacji talent."
                width={SHOTS.statystyki.w}
                height={SHOTS.statystyki.h}
                sizes="(max-width: 860px) 100vw, 620px"
                quality={75}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sec}>
        <div className={styles.wrap}>
          <div className={`${styles.split} ${styles.rev}`}>
            <div>
              <h2 className={`${styles.h2} ${styles.rv}`}>Zawsze pod ręką, także na boisku</h2>
              <p className={`${styles.sub} ${styles.rv}`}>
                Telefon w kieszeni wystarczy, żeby sprawdzić plan dnia, zaznaczyć obecność i zajrzeć w kalendarz.
              </p>
              <ul className={styles.ticks}>
                <Tick>Widok dostosowany do telefonu i komputera</Tick>
                <Tick>Ekran „Dzisiaj" pokazuje, co masz zaplanowane</Tick>
                <Tick>Szybkie dodawanie treningów, meczów i turniejów</Tick>
              </ul>
            </div>
            <div className={styles.media}>
              <div className={`${styles.phone} ${styles.shot} ${styles.rv}`}>
                <Image
                  src={SHOTS.kalendarzM.src}
                  alt="Kalendarz w aplikacji talent. na telefonie"
                  width={SHOTS.kalendarzM.w}
                  height={SHOTS.kalendarzM.h}
                  sizes="(max-width: 860px) 80vw, 300px"
                  quality={75}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sec}>
        <div className={styles.wrap}>
          <div className={styles.split} style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ maxWidth: 720 }}>
              <h2 className={`${styles.h2} ${styles.rv}`}>Zbudowana przez trenera</h2>
              <p className={`${styles.sub} ${styles.rv}`} style={{ maxWidth: 'none' }}>
                Jestem Adam, trener pracujący z najmłodszymi. Przez lata kadra, obecności i plany treningów żyły u
                mnie w kilku miejscach naraz, więc zbudowałem aplikację, która trzyma to razem. Każda funkcja wynika
                z potrzeby na boisku.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sec}>
        <div className={styles.wrap}>
          <h2 className={`${styles.h2} ${styles.rv}`}>Najczęstsze pytania</h2>
          <div className={styles.faq}>
            <details className={styles.rv}>
              <summary>Na jakich urządzeniach działa talent.?</summary>
              <p>Na telefonie i komputerze, w przeglądarce. Możesz dodać ją do ekranu głównego telefonu.</p>
            </details>
            <details className={styles.rv}>
              <summary>Czy rodzice mają dostęp do aplikacji?</summary>
              <p>
                Na razie aplikacja jest przeznaczona dla trenera. Dostęp dla rodziców planuję w kolejnych wersjach.
              </p>
            </details>
            <details className={styles.rv}>
              <summary>Jakie dane zawodników są w aplikacji?</summary>
              <p>
                Aplikacja służy do prowadzenia kadry: imię i nazwisko, rocznik, pozycja, numer i obecność na
                treningach. Szczegóły opisuje polityka prywatności.
              </p>
            </details>
            <details className={styles.rv}>
              <summary>Kto tworzy talent.?</summary>
              <p>Trener pracujący z najmłodszymi. Aplikacja powstaje z potrzeb prawdziwej drużyny.</p>
            </details>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CTA "Dołącz do testów" - przeprojektowane
          ═══════════════════════════════════════════════════════════ */}
      <div className={styles.sec} id="testy">
        <div className={styles.wrap}>
          <div className={`${styles.ctaBox} ${styles.rv}`}>
            {/* Eyebrow */}
            <div className={styles.ctaEyebrow}>Zaproszenie do testów</div>

            {/* Nagłówek */}
            <h2 className={styles.h2} style={{ marginBottom: 16 }}>
              Dołącz do testów talent.
            </h2>

            {/* Podtytuł */}
            <p className={styles.sub} style={{ maxWidth: 560, margin: '0 auto 32px' }}>
              Szukam trenerów pracujących z dziećmi i młodzieżą, którzy chcą przetestować Talent
              i podzielić się opinią. W zamian — darmowy dostęp i realny wpływ na rozwój aplikacji.
            </p>

            {/* 3 korzyści */}
            <div className={styles.ctaBenefits}>
              <div className={styles.ctaBenefit}>
                <div className={styles.ctaBenefitIcon}>✓</div>
                <div>
                  <div className={styles.ctaBenefitTitle}>Darmowy dostęp</div>
                  <div className={styles.ctaBenefitDesc}>Pełna wersja bez opłat</div>
                </div>
              </div>
              <div className={styles.ctaBenefit}>
                <div className={styles.ctaBenefitIcon}>⚡</div>
                <div>
                  <div className={styles.ctaBenefitTitle}>Wpływ na rozwój</div>
                  <div className={styles.ctaBenefitDesc}>Twoje uwagi kształtują apkę</div>
                </div>
              </div>
              <div className={styles.ctaBenefit}>
                <div className={styles.ctaBenefitIcon}>✉</div>
                <div>
                  <div className={styles.ctaBenefitTitle}>Bez spamu</div>
                  <div className={styles.ctaBenefitDesc}>Jeden mail, żadnych newsletterów</div>
                </div>
              </div>
            </div>

            {/* Formularz */}
            <div className={styles.ctaForm}>
              <a
                className={`${styles.btn} ${styles.btnP} ${styles.ctaBtn}`}
                href={SIGNUP_URL}
              >
                Zarejestruj się za darmo
              </a>
              <a className={styles.ctaBtnSecondary} href={`mailto:${CONTACT_EMAIL}`}>
                lub napisz: {CONTACT_EMAIL}
              </a>
            </div>

            {/* Social proof */}
            <p className={styles.ctaFoot}>
              Zajmie Ci to 30 sekund. Bez karty kredytowej.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.foot}>
          <span>© 2026 talent.</span>
          <span>
            <a href="/prywatnosc">Polityka prywatności</a>
            <a href="/regulamin">Regulamin</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>Kontakt</a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook talent."
            >
              Facebook
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div className={`${styles.step} ${styles.rv}`}>
      <div className={styles.num}>{n}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function Tick({ children }: { children: ReactNode }) {
  return (
    <li>
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4ade80"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function FeatureIcon({ kind }: { kind: FeatureIcon }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#4ade80',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (kind) {
    case 'users':
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx={9} cy={7} r={4} />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x={3} y={4} width={18} height={18} rx={2} />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case 'dots':
      return (
        <svg {...common}>
          <circle cx={5} cy={12} r={1.5} />
          <circle cx={10} cy={12} r={1.5} />
          <circle cx={15} cy={12} r={1.5} />
          <circle cx={20} cy={12} r={1.5} />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      );
    case 'file':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <rect x={5} y={2} width={14} height={20} rx={2} />
          <path d="M12 18h.01" />
        </svg>
      );
  }
}

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}