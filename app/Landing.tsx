'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './landing.module.css';

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61595246542172';
const CONTACT_EMAIL = 'kontakt@talentapp.pl';

const SHOTS = {
  kadra: { src: '/screenshots/screen1-lista-kadry.webp', w: 1280, h: 800 },
  kalendarzD: { src: '/screenshots/screen2-kalendarz-desktop.webp', w: 1280, h: 800 },
  statystyki: { src: '/screenshots/screen3-statystyki.webp', w: 1280, h: 800 },
  kalendarzM: { src: '/screenshots/screen4-kalendarz-mobile.webp', w: 720, h: 1560 },
} as const;

export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={rootRef} className={styles.root}>
      {/* NAVBAR */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            talent<span className={styles.dot} />
          </Link>
          <div className={styles.navLinks}>
            <a href="#funkcje" className={styles.navLink}>Funkcje</a>
            <a href="#jak" className={styles.navLink}>Jak działa</a>
            <a href="#cennik" className={styles.navLink}>Cennik</a>
            <Link href="/auth/sign-up" className={styles.navCta}>
              Zacznij bezpłatnie
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} />
                Wersja testowa — darmowy dostęp
              </div>

              <h1 className={styles.heroTitle}>
                Koniec z <span className={styles.strikeThrough}>Excelem</span> i kartkami na treningach.
              </h1>

              <p className={styles.heroSubtitle}>
                Talent to prosta aplikacja dla trenerów piłki nożnej dzieci i młodzieży.
                Prowadź kadrę, planuj treningi i licz obecność w jednym miejscu.
              </p>

              <div className={styles.heroCtas}>
                <Link href="/auth/sign-up" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                  Zacznij bezpłatnie
                </Link>
                <a href="#jak" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`}>
                  Jak to działa
                </a>
              </div>

              <div className={styles.heroTrust}>
                <div className={styles.heroTrustItem}>
                  <span className={styles.heroTrustIcon}>✓</span>
                  Bez karty kredytowej
                </div>
                <div className={styles.heroTrustItem}>
                  <span className={styles.heroTrustIcon}>✓</span>
                  Bez instalacji
                </div>
                <div className={styles.heroTrustItem}>
                  <span className={styles.heroTrustIcon}>✓</span>
                  Działa na telefonie
                </div>
              </div>
            </div>

            <div className={`${styles.heroVisual} ${styles.rv}`}>
              <div className={styles.heroVisualGlow} />
              <div className={styles.heroImageWrapper}>
                <Image
                  src={SHOTS.kalendarzD.src}
                  alt="Widok kalendarza w aplikacji Talent"
                  width={SHOTS.kalendarzD.w}
                  height={SHOTS.kalendarzD.h}
                  sizes="(max-width: 900px) 100vw, 620px"
                  quality={85}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className={styles.problemSection}>
        <div className={styles.container}>
          <div className={`${styles.problemCard} ${styles.rv}`}>
            <div className={styles.problemIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h2 className={styles.problemTitle}>Znasz to?</h2>
            <p className={styles.problemText}>
              Lista zawodników w Excelu. Plan treningów w kalendarzu Google.
              Obecność na kartce. Rozmowy z rodzicami na grupie WhatsApp.
              A na koniec sezonu — tydzień liczenia frekwencji w arkuszu.
            </p>
            <p className={styles.problemConclusion}>
              <strong>Talent zbiera to wszystko w jedno miejsce.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* FUNKCJE */}
      <section className={styles.features} id="funkcje">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Funkcje</div>
            <h2 className={styles.sectionTitle}>Wszystko, czego potrzebujesz</h2>
            <p className={styles.sectionSubtitle}>
              Tylko to, co naprawdę przydaje się przy prowadzeniu drużyny.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={`${styles.featureCard} ${styles.featureCardLarge} ${styles.rv}`}>
              <div className={styles.featureCardHeader}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className={styles.featureCardTitle}>Kadra w jednym miejscu</h3>
              </div>
              <p className={styles.featureCardText}>
                Imię, rocznik, pozycja, numer, kontakt do rodzica i notatki trenera.
                Szukaj, sortuj i filtruj — jak w prawdziwej aplikacji.
              </p>
              <div className={styles.featureCardImage}>
                <Image
                  src={SHOTS.kadra.src}
                  alt="Lista zawodników w Talent"
                  width={SHOTS.kadra.w}
                  height={SHOTS.kadra.h}
                  sizes="(max-width: 900px) 100vw, 600px"
                  quality={80}
                />
              </div>
            </div>

            <div className={`${styles.featureCard} ${styles.rv}`}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Kalendarz treningów</h3>
              <p className={styles.featureCardText}>
                Treningi, mecze, sparingi i turnieje w jednym kalendarzu.
                Każdy typ ma swój kolor.
              </p>
            </div>

            <div className={`${styles.featureCard} ${styles.rv}`}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4 12 14.01l-3-3" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Obecność w 2 kliknięcia</h3>
              <p className={styles.featureCardText}>
                Otwierasz trening, zaznaczasz kto przyszedł, zapisujesz.
                Bez kartki, bez Excela.
              </p>
            </div>

            <div className={`${styles.featureCard} ${styles.rv}`}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Statystyki frekwencji</h3>
              <p className={styles.featureCardText}>
                Widzisz kto przestał przychodzić, zanim zrobi się z tego problem.
                Ranking, wykresy, alerty.
              </p>
            </div>

            <div className={`${styles.featureCard} ${styles.rv}`}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>Eksport do PDF</h3>
              <p className={styles.featureCardText}>
                Wydrukuj plan tygodnia i powieś w szatni.
                Albo wyślij rodzicom jako plik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* JAK DZIAŁA */}
      <section className={styles.howSection} id="jak">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Jak to działa</div>
            <h2 className={styles.sectionTitle}>Trzy kroki do porządku</h2>
          </div>

          <div className={styles.stepsGrid}>
            <div className={`${styles.stepCard} ${styles.rv}`}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Utwórz drużynę</h3>
              <p className={styles.stepText}>
                Nazwa, rocznik i kolor. Zajmie Ci to 30 sekund.
              </p>
            </div>

            <div className={`${styles.stepCard} ${styles.rv}`}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Dodaj zawodników</h3>
              <p className={styles.stepText}>
                Wpisz imiona i nazwiska, rocznik, pozycję i numer na koszulce.
              </p>
            </div>

            <div className={`${styles.stepCard} ${styles.rv}`}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Planuj i zaznaczaj</h3>
              <p className={styles.stepText}>
                Dodaj trening do kalendarza. Po treningu zaznacz obecność w 2 kliknięcia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className={styles.quoteSection}>
        <div className={styles.container}>
          <div className={`${styles.quoteCard} ${styles.rv}`}>
            <div className={styles.quoteMark}>"</div>
            <p className={styles.quoteText}>
              Prowadzę drużynę dzieci od 4 lat. Przez ten czas przewinęło się przez moje ręce
              kilka arkuszy, dziesiątki kartek i wiele nieodczytanych wiadomości na grupie.
              Talent to pierwsze narzędzie, które faktycznie upraszcza, a nie komplikuje.
            </p>
            <div className={styles.quoteAuthor}>
              <div className={styles.quoteAvatar}>A</div>
              <div>
                <div className={styles.quoteName}>Adam Pilny</div>
                <div className={styles.quoteRole}>Trener, twórca Talent</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE */}
      <section className={styles.mobileSection}>
        <div className={styles.container}>
          <div className={styles.mobileGrid}>
            <div className={`${styles.mobileContent} ${styles.rv}`}>
              <div className={styles.sectionEyebrow}>Na boisku i w domu</div>
              <h2 className={styles.sectionTitle}>Zawsze pod ręką</h2>
              <p className={styles.sectionSubtitle}>
                Działa w przeglądarce na telefonie i komputerze. Możesz ją dodać
                do ekranu głównego — uruchamia się jak zwykła aplikacja.
              </p>

              <ul className={styles.mobileList}>
                <li className={styles.mobileListItem}>
                  <span className={styles.mobileListCheck}>✓</span>
                  <span>Nie musisz nic instalować ze sklepu</span>
                </li>
                <li className={styles.mobileListItem}>
                  <span className={styles.mobileListCheck}>✓</span>
                  <span>Działa offline — dane zsynchronizują się później</span>
                </li>
                <li className={styles.mobileListItem}>
                  <span className={styles.mobileListCheck}>✓</span>
                  <span>Ekran „Dzisiaj" pokazuje plan dnia na pierwszy rzut oka</span>
                </li>
              </ul>
            </div>

            <div className={`${styles.mobilePhone} ${styles.rv}`}>
              <div className={styles.mobilePhoneFrame}>
                <Image
                  src={SHOTS.kalendarzM.src}
                  alt="Aplikacja Talent na telefonie"
                  width={SHOTS.kalendarzM.w}
                  height={SHOTS.kalendarzM.h}
                  sizes="(max-width: 900px) 70vw, 320px"
                  quality={85}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>FAQ</div>
            <h2 className={styles.sectionTitle}>Często pytacie</h2>
          </div>

          <div className={styles.faq}>
            <details className={`${styles.faqItem} ${styles.rv}`}>
              <summary className={styles.faqQuestion}>
                Ile kosztuje Talent?
                <span className={styles.faqChevron}>+</span>
              </summary>
              <div className={styles.faqAnswer}>
                W tej chwili Talent jest bezpłatny w wersji testowej. Szukam trenerów,
                którzy zechcą przetestować aplikację i podzielić się opinią.
                W przyszłości planuję płatne plany dla dużych klubów.
              </div>
            </details>

            <details className={`${styles.faqItem} ${styles.rv}`}>
              <summary className={styles.faqQuestion}>
                Czy muszę coś instalować?
                <span className={styles.faqChevron}>+</span>
              </summary>
              <div className={styles.faqAnswer}>
                Nie. Talent działa w przeglądarce — na telefonie i komputerze.
                Możesz ją dodać do ekranu głównego telefonu (jedno kliknięcie) i będzie
                uruchamiać się jak zwykła aplikacja, ale nie wymaga instalacji ze sklepu.
              </div>
            </details>

            <details className={`${styles.faqItem} ${styles.rv}`}>
              <summary className={styles.faqQuestion}>
                Co z danymi mojej drużyny?
                <span className={styles.faqChevron}>+</span>
              </summary>
              <div className={styles.faqAnswer}>
                Dane są Twoje. Nie sprzedajemy ich, nie udostępniamy nikomu.
                Możesz je w każdej chwili usunąć, razem z całym kontem.
                Szczegóły w polityce prywatności.
              </div>
            </details>

            <details className={`${styles.faqItem} ${styles.rv}`}>
              <summary className={styles.faqQuestion}>
                Czy rodzice mają dostęp do aplikacji?
                <span className={styles.faqChevron}>+</span>
              </summary>
              <div className={styles.faqAnswer}>
                Na razie aplikacja jest dla trenerów. Dostęp dla rodziców planuję
                w kolejnych wersjach — najpierw chcę dopracować to co najważniejsze.
              </div>
            </details>

            <details className={`${styles.faqItem} ${styles.rv}`}>
              <summary className={styles.faqQuestion}>
                Kto tworzy Talent?
                <span className={styles.faqChevron}>+</span>
              </summary>
              <div className={styles.faqAnswer}>
                Jestem Adam — trener pracujący z dziećmi i młodzieżą.
                Talent to moje narzędzie, którego brakowało mi w codziennej pracy.
                Każda funkcja wynika z realnej potrzeby na boisku.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={styles.ctaSection} id="cennik">
        <div className={styles.container}>
          <div className={`${styles.ctaCard} ${styles.rv}`}>
            <div className={styles.ctaGlow} />
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Gotowy uporządkować drużynę?</h2>
              <p className={styles.ctaSubtitle}>
                Załóż konto w 30 sekund. Bez karty kredytowej.
                Zacznij prowadzić kadrę i obecność w jednym miejscu — już dziś.
              </p>

              <div className={styles.ctaActions}>
                <Link href="/auth/sign-up" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                  Zacznij bezpłatnie
                </Link>
                <a href={`mailto:${CONTACT_EMAIL}`} className={styles.ctaEmail}>
                  lub napisz: {CONTACT_EMAIL}
                </a>
              </div>

              <div className={styles.ctaFooter}>
                Wersja testowa — darmowy dostęp dla pierwszych trenerów.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <div className={styles.logo}>
                talent<span className={styles.dot} />
              </div>
              <div className={styles.footerCopy}>© 2026 Talent. Wszelkie prawa zastrzeżone.</div>
            </div>

            <div className={styles.footerLinks}>
              <Link href="/prywatnosc" className={styles.footerLink}>Polityka prywatności</Link>
              <Link href="/regulamin" className={styles.footerLink}>Regulamin</Link>
              <a href={`mailto:${CONTACT_EMAIL}`} className={styles.footerLink}>Kontakt</a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}