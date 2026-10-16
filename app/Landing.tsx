'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE — talent-landing-wow-v2
   Konwersja z HTML → React
   - demo z klikaniem kropek obecności
   - intro animation (raz na sesję)
   - parallax demo
   - scroll progress bar
   - mobile sticky CTA
   ═══════════════════════════════════════════════════════════════ */

// Typy dla danych demo
type DemoZawodnik = {
  imie: string;
  inicjaly: string;
  opis: string;
  kropki: number[];
};

// Dane demo — te same co w HTML
const DEMO_DANE: DemoZawodnik[] = [
  { imie: 'Antoni Adamski', inicjaly: 'AA', opis: '2018 · Pomocnik', kropki: [1, 1, 0, 1, 1] },
  { imie: 'Bruno Bielski', inicjaly: 'BB', opis: '2020 · Napastnik', kropki: [1, 0, 1, 1, 1] },
  { imie: 'Czarek Cichy', inicjaly: 'CC', opis: '2020 · Pomocnik', kropki: [0, 0, 1, 0, 1] },
  { imie: 'Dawid Dąbrowski', inicjaly: 'DD', opis: '2021 · Bramkarz', kropki: [1, 1, 1, 1, 1] },
  { imie: 'Filip Fijał', inicjaly: 'FF', opis: '2020 · Napastnik', kropki: [1, 1, 0, 1, 1] },
];

const INTRO_KEY = 'talent_intro_shown';

export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hwRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const spRef = useRef<HTMLDivElement>(null);
  const mctaRef = useRef<HTMLAnchorElement>(null);
  const testyRef = useRef<HTMLDivElement>(null);

  const [showIntro, setShowIntro] = useState(false);
  const [demo, setDemo] = useState<DemoZawodnik[]>(() =>
    DEMO_DANE.map((z) => ({ ...z, kropki: [...z.kropki] })),
  );
  const [pct, setPct] = useState(80);
  const shownPctRef = useRef(80);
  const rafRef = useRef<number | null>(null);

  // ═══ Intro animation — tylko raz na sesję ═══
  useEffect(() => {
    try {
      const shown = sessionStorage.getItem(INTRO_KEY);
      if (!shown) {
        setShowIntro(true);
        sessionStorage.setItem(INTRO_KEY, '1');
      }
    } catch {
      // sessionStorage może być zablokowane (tryb prywatny) — pomiń intro
    }
  }, []);

  // ═══ Scroll progress + mobile CTA ═══
  useEffect(() => {
    let tick = false;
    let vis = false;

    const update = () => {
      tick = false;
      const sp = spRef.current;
      const mcta = mctaRef.current;
      if (!sp || !mcta) return;

      const h = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      sp.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;

      const showMcta = y > 600 && !vis;
      mcta.classList.toggle(styles.mctaOn, showMcta);
    };

    const onScroll = () => {
      if (!tick) {
        tick = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    // IntersectionObserver dla mobile CTA (ukryj gdy widoczne CTA na dole)
    let io: IntersectionObserver | null = null;
    if (testyRef.current) {
      io = new IntersectionObserver(
        (entries) => {
          vis = entries[0].isIntersecting;
          update();
        },
        { threshold: 0.2 },
      );
      io.observe(testyRef.current);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);

  // ═══ Parallax demo (tylko desktop + bez reduced motion) ═══
  useEffect(() => {
    const hw = hwRef.current;
    const demoEl = demoRef.current;
    if (!hw || !demoEl) return;

    const fine =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) return;

    const onMove = (e: PointerEvent) => {
      const b = hw.getBoundingClientRect();
      hw.style.setProperty('--mx', `${e.clientX - b.left}px`);
      hw.style.setProperty('--my', `${e.clientY - b.top}px`);

      const c = demoEl.getBoundingClientRect();
      const dx = (e.clientX - (c.left + c.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (c.top + c.height / 2)) / window.innerHeight;
      demoEl.style.transform = `rotateY(${dx * 14}deg) rotateX(${-dy * 10}deg)`;
    };

    const onLeave = () => {
      demoEl.style.transform = '';
    };

    hw.addEventListener('pointermove', onMove);
    hw.addEventListener('pointerleave', onLeave);

    return () => {
      hw.removeEventListener('pointermove', onMove);
      hw.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  // ═══ Reveal on scroll (IntersectionObserver) ═══
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.rvIn);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    const els = root.querySelectorAll<HTMLElement>(
      `.card, .step, .sec .h2, .sec .sub, .sec .media, .ticks li, .faq details, .ctaBox, .tr > div, .ba > div`,
    );
    els.forEach((el, i) => {
      el.classList.add(styles.rv);
      (el as HTMLElement).style.transitionDelay = `${(i % 3) * 80}ms`;
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  // ═══ Karta hover — podświetlenie pod kursorem ═══
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = root.querySelectorAll<HTMLElement>(`.${styles.card}`);
    const handlers: { el: HTMLElement; fn: (e: PointerEvent) => void }[] = [];

    cards.forEach((card) => {
      const fn = (e: PointerEvent) => {
        const b = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - b.left}px`);
        card.style.setProperty('--y', `${e.clientY - b.top}px`);
      };
      card.addEventListener('pointermove', fn);
      handlers.push({ el: card, fn });
    });

    return () => {
      handlers.forEach(({ el, fn }) => el.removeEventListener('pointermove', fn));
    };
  }, []);

  // ═══ Obliczanie frekwencji z demo ═══
  useEffect(() => {
    const on = demo.reduce((sum, z) => sum + z.kropki.reduce((a, b) => a + b, 0), 0);
    const all = demo.length * 5;
    const target = Math.round((on / all) * 100);
    const from = shownPctRef.current;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const t0 = performance.now();

    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 450);
      const v = Math.round(from + (target - from) * k);
      setPct(v);
      if (k < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        shownPctRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [demo]);

  const toggleKropka = (ri: number, di: number) => {
    setDemo((prev) =>
      prev.map((z, i) =>
        i === ri
          ? {
              ...z,
              kropki: z.kropki.map((v, j) => (j === di ? (v ? 0 : 1) : v)),
            }
          : z,
      ),
    );
  };

  return (
    <div ref={rootRef} className={styles.root}>
      {/* Intro animation — tylko raz na sesję */}
      {showIntro && (
        <div className={styles.intro} aria-hidden="true">
          <div className={styles.introLogo}>
            talent<span className={styles.introBall} />
          </div>
        </div>
      )}

      {/* Scroll progress bar */}
      <div ref={spRef} className={styles.sp} aria-hidden="true" />

      {/* ─── Nav bar ─────────────────────────────────────────── */}
      <div className={styles.bar}>
        <div className={styles.wrap}>
          <div className={styles.nav}>
            <Link href="/" className={styles.logo}>
              talent<span className={styles.dot} />
            </Link>
            <Link href="/auth/sign-up" className={`${styles.btn} ${styles.btnP}`}>
              Zapisz się na testy
            </Link>
          </div>
        </div>

        {/* ─── Hero ─────────────────────────────────────────── */}
        <div className={styles.hw} ref={hwRef}>
          <svg
            className={styles.pitch}
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect pathLength={1} x="40" y="40" width="1120" height="620" rx="6" />
            <path pathLength={1} d="M600 40V660" />
            <circle pathLength={1} cx="600" cy="350" r="110" />
            <rect pathLength={1} x="40" y="190" width="170" height="320" />
            <rect pathLength={1} x="990" y="190" width="170" height="320" />
          </svg>

          <div className={styles.wrap}>
            <div className={styles.hero2}>
              <div>
                <div className={`${styles.eyebrow} ${styles.fd}`}>
                  Aplikacja dla trenerów piłki nożnej młodzieżowej
                </div>
                <h1 className={styles.h1}>
                  <span className={styles.w} style={{ ['--i' as never]: 0 }}>Twoja</span>{' '}
                  <span className={styles.w} style={{ ['--i' as never]: 1 }}>drużyna,</span>{' '}
                  <span className={`${styles.w} ${styles.green}`} style={{ ['--i' as never]: 2 }}>Twoje</span>{' '}
                  <span className={`${styles.w} ${styles.green}`} style={{ ['--i' as never]: 3 }}>zasady.</span>
                </h1>
                <p className={`${styles.lead} ${styles.fd}`}>
                  Obecność i plan treningów w jednym miejscu. Koniec z kartkami, Excelem i szukaniem wiadomości na grupach.
                </p>
                <div className={`${styles.ctas} ${styles.fd}`}>
                  <Link href="/auth/sign-up" className={`${styles.btn} ${styles.btnP}`}>
                    Zapisz się na testy
                  </Link>
                  <a href="#funkcje" className={`${styles.btn} ${styles.btnS}`}>
                    Zobacz, jak to działa
                  </a>
                </div>
              </div>

              {/* ─── Demo ───────────────────────────────────── */}
              <div className={styles.demoWrap}>
                <div className={styles.demo} ref={demoRef}>
                  <div className={styles.dh}>
                    <span>LISTA ZAWODNIKÓW</span>
                    <small>SKRZATY · DEMO</small>
                  </div>

                  <div>
                    {demo.map((z, ri) => {
                      const obecnosci = z.kropki.reduce((a, b) => a + b, 0);
                      const pokazWarn = obecnosci / 5 < 0.7;
                      return (
                        <div key={z.imie} className={styles.row}>
                          <div className={styles.av}>{z.inicjaly}</div>
                          <div className={styles.nm}>
                            <b>{z.imie}</b>
                            <span>{z.opis}</span>
                          </div>
                          <span className={`${styles.warn} ${pokazWarn ? styles.warnShow : ''}`}>
                            do poprawy
                          </span>
                          <div className={styles.dots}>
                            {z.kropki.map((v, di) => {
                              const isHint = ri === 2 && di === 1 && v === 0;
                              return (
                                <button
                                  key={di}
                                  type="button"
                                  onClick={() => toggleKropka(ri, di)}
                                  aria-label={`${z.imie}, trening ${di + 1}: ${v ? 'obecny' : 'nieobecny'}`}
                                  className={`${styles.d} ${!v ? styles.dOff : ''} ${isHint ? styles.dHint : ''}`}
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
                      style={{ ['--p' as never]: pct }}
                    >
                      <div>{pct}%</div>
                    </div>
                    <p>
                      <b>Frekwencja drużyny.</b>
                      <br />
                      Kliknij kropkę, żeby zmienić obecność i zobaczyć, jak zmienia się wynik.
                      Dane w demo są fikcyjne.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Marquee ─────────────────────────────────────── */}
        <div className={styles.mq} aria-hidden="true">
          <div>
            <span>KADRA</span>
            <span>KALENDARZ</span>
            <span>FREKWENCJA</span>
            <span>STATYSTYKI</span>
            <span>EKSPORT PDF</span>
            <span>TELEFON I KOMPUTER</span>
            <span>KADRA</span>
            <span>KALENDARZ</span>
            <span>FREKWENCJA</span>
            <span>STATYSTYKI</span>
            <span>EKSPORT PDF</span>
            <span>TELEFON I KOMPUTER</span>
          </div>
        </div>
      </div>

      {/* ─── Trust bar ─────────────────────────────────────── */}
      <div className={styles.wrap}>
        <div className={styles.tr}>
          <div><i>●</i>Darmowe na start</div>
          <div><i>●</i>Bez instalacji ze sklepu</div>
          <div><i>●</i>Telefon i komputer</div>
          <div><i>●</i>Dane tylko Twojej drużyny</div>
        </div>
      </div>

      {/* ─── Przed / Po ──────────────────────────────────────── */}
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <h2 className={styles.h2}>Przed i po talent.</h2>
          <div className={styles.ba}>
            <div className={styles.bad}>
              <h3>Dotychczas</h3>
              <ul>
                <li>Kartka z obecnością w teczce</li>
                <li>Excel, którego nikt nie aktualizuje</li>
                <li>Plan rozsypany po grupach i komunikatorach</li>
                <li>Na koniec sezonu liczenie na palcach</li>
              </ul>
            </div>
            <div className={styles.good}>
              <h3>Z talent.</h3>
              <ul>
                <li>Obecność odhaczana na telefonie</li>
                <li>Cały plan w jednym kalendarzu</li>
                <li>Frekwencja liczy się sama</li>
                <li>Eksport do PDF jednym kliknięciem</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Jak to działa ───────────────────────────────────── */}
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <h2 className={styles.h2}>Jak to działa</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.num}>1</div>
              <h3>Dodaj drużynę</h3>
              <p>Wpisz zawodników z rocznikiem, pozycją i numerem.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.num}>2</div>
              <h3>Zaplanuj treningi i mecze</h3>
              <p>Wszystko w kalendarzu, każde wydarzenie w swoim kolorze.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.num}>3</div>
              <h3>Zaznaczaj obecność</h3>
              <p>Kropki przy zawodnikach i statystyki drużyny liczą się same.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Funkcje ────────────────────────────────────────── */}
      <div className={styles.sec} id="funkcje">
        <div className={styles.wrap}>
          <h2 className={styles.h2}>Wszystko, czego trener potrzebuje na co dzień</h2>
          <p className={styles.sub}>
            Tylko to, co naprawdę przydaje się przy prowadzeniu drużyny dzieci i młodzieży.
          </p>
          <div className={styles.grid}>
            <FeatureCard
              icon={<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />}
              title="Kadra"
              desc="Lista zawodników z rocznikiem, pozycją i numerem. Szukaj, sortuj, miej wszystko pod ręką."
            />
            <FeatureCard
              icon={<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>}
              title="Kalendarz"
              desc="Treningi, mecze, sparingi i turnieje w jednym kalendarzu, każde w swoim kolorze."
            />
            <FeatureCard
              icon={<><circle cx="5" cy="12" r="1.5" /><circle cx="10" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="20" cy="12" r="1.5" /></>}
              title="Frekwencja na pierwszy rzut oka"
              desc="Przy każdym zawodniku widzisz kropki z ostatnich treningów i od razu wiesz, kto przestał przychodzić."
            />
            <FeatureCard
              icon={<path d="M18 20V10M12 20V4M6 20v-6" />}
              title="Statystyki"
              desc="Średnia frekwencja, wykres miesięczny, ranking obecności i lista zawodników do poprawy."
            />
            <FeatureCard
              icon={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" /></>}
              title="Eksport do PDF"
              desc="Wydrukuj kalendarz albo wyślij go dalej, kiedy potrzebujesz wersji na papierze."
            />
            <FeatureCard
              icon={<><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></>}
              title="Telefon i komputer"
              desc="Działa w przeglądarce i można ją dodać do ekranu głównego. Bez instalowania ze sklepu."
            />
          </div>
        </div>
      </div>

      {/* ─── Frekwencja bez liczenia ─────────────────────────── */}
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <div className={styles.split}>
            <div>
              <h2 className={styles.h2}>Frekwencja bez liczenia</h2>
              <p className={styles.sub}>
                Zamiast przeglądać kartki, wybierasz okres i widzisz obraz drużyny.
              </p>
              <ul className={styles.ticks}>
                <Tick>Okres do wyboru: 30 dni, 3 miesiące, sezon albo cały okres</Tick>
                <Tick>Wykres miesiąc po miesiącu pokazuje trend</Tick>
                <Tick>Ranking obecności i lista zawodników z frekwencją poniżej 70%</Tick>
              </ul>
            </div>
            <div className={`${styles.media} ${styles.rv}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screenshots/screen3-statystyki.png"
                alt="Widok statystyk frekwencji drużyny w aplikacji talent."
                width={1280}
                height={800}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Zawsze pod ręką ─────────────────────────────────── */}
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <div className={`${styles.split} ${styles.splitRev}`}>
            <div>
              <h2 className={styles.h2}>Zawsze pod ręką, także na boisku</h2>
              <p className={styles.sub}>
                Telefon w kieszeni wystarczy, żeby sprawdzić plan dnia, zaznaczyć obecność i zajrzeć w kalendarz.
              </p>
              <ul className={styles.ticks}>
                <Tick>Widok dostosowany do telefonu i komputera</Tick>
                <Tick>Ekran „Dzisiaj" pokazuje, co masz zaplanowane</Tick>
                <Tick>Szybkie dodawanie treningów, meczów i turniejów</Tick>
              </ul>
            </div>
            <div className={styles.media}>
              <div className={`${styles.phone} ${styles.media}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/screenshots/screen4-kalendarz-mobile.png"
                  alt="Kalendarz w aplikacji talent. na telefonie"
                  width={720}
                  height={1560}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Zbudowana przez trenera ─────────────────────────── */}
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <div className={styles.split} style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ maxWidth: 720 }}>
              <h2 className={styles.h2}>Zbudowana przez trenera</h2>
              <p className={styles.sub} style={{ maxWidth: 'none' }}>
                Jestem Adam, trener pracujący z najmłodszymi. Przez lata kadra, obecności i plany treningów żyły u mnie w kilku miejscach naraz, więc zbudowałem aplikację, która trzyma to razem. Każda funkcja wynika z potrzeby na boisku.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      <div className={styles.sec}>
        <div className={styles.wrap}>
          <h2 className={styles.h2}>Najczęstsze pytania</h2>
          <div className={styles.faq}>
            <details>
              <summary>Na jakich urządzeniach działa talent.?</summary>
              <p>Na telefonie i komputerze, w przeglądarce. Możesz dodać ją do ekranu głównego telefonu.</p>
            </details>
            <details>
              <summary>Czy rodzice mają dostęp do aplikacji?</summary>
              <p>Na razie aplikacja jest przeznaczona dla trenera. Dostęp dla rodziców planuję w kolejnych wersjach.</p>
            </details>
            <details>
              <summary>Jakie dane zawodników są w aplikacji?</summary>
              <p>Aplikacja służy do prowadzenia kadry: imię i nazwisko, rocznik, pozycja, numer i obecność na treningach. Szczegóły opisuje polityka prywatności.</p>
            </details>
            <details>
              <summary>Kto tworzy talent.?</summary>
              <p>Trener pracujący z najmłodszymi. Aplikacja powstaje z potrzeb prawdziwej drużyny.</p>
            </details>
          </div>
        </div>
      </div>

      {/* ─── CTA końcowe ─────────────────────────────────────── */}
      <div className={styles.sec} id="testy" ref={testyRef}>
        <div className={styles.wrap}>
          <div className={styles.ctaBox}>
            <h2 className={styles.h2}>Szukam trenerów do testów</h2>
            <p className={styles.sub}>
              Dla trenerów pracujących z dziećmi i młodzieżą. W zamian za darmowy dostęp proszę o szczerą opinię, co poprawić.
            </p>
            <div className={styles.ctas} style={{ justifyContent: 'center' }}>
              <Link href="/auth/sign-up" className={`${styles.btn} ${styles.btnP}`}>
                Zapisz się na testy
              </Link>
            </div>
            <p className={styles.sub} style={{ marginTop: 20, fontSize: 15 }}>
              Kontakt: <a href="mailto:kontakt@talentapp.pl">kontakt@talentapp.pl</a>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <div className={styles.wrap}>
        <div className={styles.foot}>
          <span>© 2026 talent.</span>
          <span>
            <Link href="/prywatnosc">Polityka prywatności</Link>
            <Link href="/regulamin">Regulamin</Link>
          </span>
        </div>
      </div>

      {/* ─── Mobile sticky CTA ──────────────────────────────── */}
      <a
        ref={mctaRef}
        href="/auth/sign-up"
        className={styles.mcta}
      >
        Zapisz się na testy
      </a>
    </div>
  );
}

/* ─── Helper: karta funkcji ─────────────────────────────── */
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.ico}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* ─── Helper: tick na liście ────────────────────────────── */
function Tick({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4ade80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span>{children}</span>
    </li>
  );
}