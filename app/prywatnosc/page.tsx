import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Polityka prywatności — Talent',
  description: 'Polityka prywatności aplikacji Talent do zarządzania drużyną piłkarską',
};

export default function PolitykaPrywatnosci() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Polityka prywatności
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Ostatnia aktualizacja: 30.09.2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Informacje ogólne</h2>
            <p className="mb-3">
              Aplikacja <strong className="text-white">Talent</strong> służy do zarządzania
              drużyną piłkarską — planowania treningów, meczów oraz ewidencji obecności
              zawodników. Administratorem danych osobowych przetwarzanych w aplikacji jest
              trener lub klub sportowy korzystający z aplikacji.
            </p>
            <p>
              Niniejsza polityka opisuje, jakie dane zbieramy, w jakim celu, w jaki sposób
              je chronimy oraz jakie prawa przysługują osobom, których dane dotyczą.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Jakie dane zbieramy</h2>
            <p className="mb-3">W aplikacji przetwarzamy następujące dane:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Imię i nazwisko zawodnika</li>
              <li>Rocznik (rok urodzenia)</li>
              <li>Pozycja na boisku (opcjonalnie)</li>
              <li>Numer na koszulce (opcjonalnie)</li>
              <li>Kontakt do rodzica lub opiekuna — numer telefonu (opcjonalnie)</li>
              <li>Notatki trenera dotyczące zawodnika (opcjonalnie)</li>
              <li>Status obecności na treningach i meczach</li>
            </ul>
            <p className="mt-3">
              Nie zbieramy danych wrażliwych, danych medycznych ani danych biometrycznych.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Cel i podstawa przetwarzania</h2>
            <p className="mb-3">
              Dane przetwarzamy wyłącznie w celu prowadzenia ewidencji członków drużyny
              oraz organizacji treningów, meczów i innych wydarzeń sportowych.
            </p>
            <p>
              Podstawą prawną przetwarzania jest zgoda rodzica lub opiekuna prawnego
              (art. 6 ust. 1 lit. a RODO) oraz prawnie uzasadniony interes administratora
              związany z prowadzeniem działalności sportowej (art. 6 ust. 1 lit. f RODO).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Dane dzieci</h2>
            <p className="mb-3">
              Aplikacja przechowuje dane osób niepełnoletnich. Wymagana jest zgoda
              rodzica lub opiekuna prawnego na przetwarzanie danych dziecka w aplikacji.
            </p>
            <p>
              Zgoda powinna być wyrażona w formie pisemnej lub elektronicznej przed
              rozpoczęciem korzystania z aplikacji. Rodzic ma prawo w każdej chwili
              wycofać zgodę — wówczas dane dziecka zostaną usunięte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Bezpieczeństwo danych</h2>
            <p className="mb-3">
              Dane są przechowywane w infrastrukturze Supabase z szyfrowaniem połączenia
              (HTTPS/TLS) oraz szyfrowaniem bazy danych w spoczynku.
            </p>
            <p>
              Dostęp do danych mają wyłącznie trenerzy zalogowani do aplikacji. Każdy trener
              widzi tylko dane swojej drużyny — dane innych drużyn są odizolowane i
              niedostępne. Stosujemy polityki Row Level Security (RLS) na poziomie bazy danych.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Udostępnianie danych</h2>
            <p>
              Nie udostępniamy danych osobowych podmiotom trzecim, nie sprzedajemy ich ani
              nie wykorzystujemy do celów marketingowych. Dane nie są przekazywane poza
              Europejski Obszar Gospodarczy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. Okres przechowywania</h2>
            <p>
              Dane są przechowywane przez okres członkostwa zawodnika w drużynie oraz przez
              czas niezbędny do realizacji celów statutowych klubu. Po zakończeniu
              współpracy dane są usuwane na żądanie rodzica lub opiekuna.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Prawa rodziców i zawodników</h2>
            <p className="mb-3">Rodzic lub opiekun prawny ma prawo do:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Dostępu do danych swojego dziecka</li>
              <li>Sprostowania (poprawienia) danych</li>
              <li>Usunięcia danych („prawo do bycia zapomnianym”)</li>
              <li>Ograniczenia przetwarzania</li>
              <li>Przenoszenia danych</li>
              <li>Wniesienia sprzeciwu wobec przetwarzania</li>
              <li>Wycofania zgody w dowolnym momencie</li>
            </ul>
            <p className="mt-3">
              Aby skorzystać z tych praw, należy skontaktować się z trenerem prowadzącym
              drużynę lub administratorem klubu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">9. Pliki cookies</h2>
            <p>
              Aplikacja używa plików cookies wyłącznie w celach technicznych — do
              utrzymania sesji zalogowanego użytkownika. Nie stosujemy cookies
              marketingowych ani analitycznych.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">10. Zmiany polityki</h2>
            <p>
              Zastrzegamy sobie prawo do zmiany niniejszej polityki. O istotnych zmianach
              użytkownicy zostaną poinformowani z odpowiednim wyprzedzeniem.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">11. Kontakt</h2>
            <p>
              W sprawach dotyczących ochrony danych osobowych prosimy o kontakt z
              administratorem aplikacji lub trenerem prowadzącym drużynę.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-xs text-slate-600">
          © 2026 Talent · Wszelkie prawa zastrzeżone
        </div>
      </div>
    </main>
  );
}