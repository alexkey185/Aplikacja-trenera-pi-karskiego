import { BackButton } from '@/components/BackButton';

export const metadata = {
  title: 'Polityka prywatności — Talent',
  description:
    'Polityka prywatności aplikacji Talent do zarządzania drużyną piłkarską',
};

export default function PolitykaPrywatnosci() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <BackButton />

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Polityka prywatności
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Ostatnia aktualizacja: 29 września 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              1. Postanowienia ogólne
            </h2>
            <p className="mb-3">
              Niniejsza Polityka prywatności opisuje zasady przetwarzania danych
              osobowych w aplikacji internetowej{' '}
              <strong className="text-white">Talent</strong> (dalej:
              „Aplikacja"), dostępnej pod adresem{' '}
              <strong className="text-white">https://[TWOJA-DOMENA].pl</strong>,
              służącej do zarządzania drużyną piłkarską — planowania treningów,
              meczów oraz prowadzenia ewidencji obecności zawodników.
            </p>
            <p>Administratorem danych osobowych (dalej: „Administrator") jest:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong className="text-white">[IMIĘ I NAZWISKO]</strong>
              </li>
              <li>
                <strong className="text-white">[ADRES]</strong>
              </li>
              <li>
                E-mail:{' '}
                <strong className="text-white">[ADRES-EMAIL-KONTAKTOWY]</strong>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              2. Jakie dane przetwarzamy
            </h2>
            <p className="mb-3">
              W Aplikacji przetwarzamy następujące kategorie danych:
            </p>

            <p className="font-semibold text-white mt-4 mb-2">
              2.1. Dane trenera (użytkownika Aplikacji):
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Adres e-mail</li>
              <li>Imię i nazwisko (opcjonalnie — podawane w profilu)</li>
              <li>Data utworzenia konta i ostatniego logowania</li>
              <li>Zaszyfrowane hasło (nie mamy do niego dostępu)</li>
            </ul>

            <p className="font-semibold text-white mt-4 mb-2">
              2.2. Dane zawodników (wprowadzane przez trenera):
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Imię i nazwisko zawodnika</li>
              <li>Rocznik (rok urodzenia)</li>
              <li>Pozycja na boisku (opcjonalnie)</li>
              <li>Numer na koszulce (opcjonalnie)</li>
              <li>Kontakt do rodzica/opiekuna — numer telefonu (opcjonalnie)</li>
              <li>Notatki trenera dotyczące zawodnika (opcjonalnie)</li>
              <li>Status obecności na treningach i meczach</li>
            </ul>

            <p className="mt-3">
              Nie przetwarzamy danych wrażliwych (art. 9 RODO), danych
              biometrycznych ani danych medycznych.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              3. Cel i podstawa prawna przetwarzania
            </h2>
            <p className="mb-3">Dane przetwarzamy w następujących celach:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Świadczenie usługi</strong> —
                umożliwienie prowadzenia ewidencji drużyny i planowania
                treningów (art. 6 ust. 1 lit. b RODO — wykonanie umowy).
              </li>
              <li>
                <strong className="text-white">
                  Prawnie uzasadniony interes
                </strong>{' '}
                — zapewnienie bezpieczeństwa i prawidłowego działania Aplikacji,
                dochodzenie roszczeń (art. 6 ust. 1 lit. f RODO).
              </li>
              <li>
                <strong className="text-white">Zgoda</strong> — rodzica lub
                opiekuna prawnego na przetwarzanie danych dziecka w Aplikacji
                (art. 6 ust. 1 lit. a RODO).
              </li>
              <li>
                <strong className="text-white">Obowiązki prawne</strong> —
                realizacja obowiązków wynikających z przepisów prawa, w tym
                podatkowych i rachunkowych (art. 6 ust. 1 lit. c RODO).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              4. Dane osób niepełnoletnich
            </h2>
            <p className="mb-3">
              Aplikacja służy do prowadzenia ewidencji drużyn, w których skład
              wchodzą osoby niepełnoletnie. Dane te są wprowadzane wyłącznie
              przez trenera, który zobowiązany jest do uzyskania pisemnej lub
              elektronicznej zgody rodzica lub opiekuna prawnego na
              przetwarzanie danych dziecka w Aplikacji.
            </p>
            <p className="mb-3">
              Zgoda obejmuje przetwarzanie danych w zakresie wskazanym w pkt 2.2
              Polityki. Rodzic lub opiekun ma prawo w każdej chwili wycofać
              zgodę — wówczas dane dziecka zostaną usunięte z Aplikacji na
              żądanie trenera lub Administratora.
            </p>
            <p>
              Zgoda jest dobrowolna. Jej brak nie wyklucza udziału dziecka w
              treningach, jednak uniemożliwia prowadzenie ewidencji obecności w
              Aplikacji.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              5. Okres przechowywania danych
            </h2>
            <p>
              Dane przetwarzamy przez okres korzystania z Aplikacji przez
              trenera, a po jego zakończeniu — przez okres niezbędny do
              realizacji celów statutowych klubu oraz przez okres wymagany
              przepisami prawa (w szczególności podatkowymi i rachunkowymi).
              Dane są usuwane na żądanie trenera lub rodzica/opiekuna.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              6. Odbiorcy danych
            </h2>
            <p className="mb-3">
              Dane osobowe mogą być przekazywane wyłącznie zaufanym podmiotom
              przetwarzającym, które świadczą usługi na rzecz Administratora w
              zakresie niezbędnym do działania Aplikacji:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Supabase Inc.</strong> —
                dostawca infrastruktury bazy danych i uwierzytelniania
                (przetwarzanie w chmurze)
              </li>
              <li>
                <strong className="text-white">Vercel Inc.</strong> — dostawca
                hostingu aplikacji
              </li>
              <li>
                <strong className="text-white">[DOSTAWCA-SMTP]</strong> —
                dostawca usługi wysyłki wiadomości e-mail (np. SendGrid,
                Resend)
              </li>
            </ul>
            <p className="mt-3">
              Dane nie są udostępniane podmiotom trzecim w celach marketingowych
              ani sprzedawane. Nie przekazujemy danych poza Europejski Obszar
              Gospodarczy (EOG) bez odpowiednich zabezpieczeń.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              7. Bezpieczeństwo danych
            </h2>
            <p className="mb-3">
              Stosujemy środki techniczne i organizacyjne zapewniające ochronę
              danych, w szczególności:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Szyfrowanie połączenia (HTTPS/TLS)</li>
              <li>Szyfrowanie bazy danych w spoczynku</li>
              <li>Zaszyfrowane hasła użytkowników (bcrypt)</li>
              <li>
                Mechanizm Row Level Security (RLS) — każdy trener widzi
                wyłącznie dane swojej drużyny
              </li>
              <li>Regularne kopie zapasowe</li>
              <li>Ograniczony dostęp do infrastruktury</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              8. Prawa osób, których dane dotyczą
            </h2>
            <p className="mb-3">
              Każdej osobie, której dane przetwarzamy, przysługują następujące
              prawa:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prawo dostępu do danych</li>
              <li>Prawo do sprostowania (poprawiania) danych</li>
              <li>Prawo do usunięcia danych („prawo do bycia zapomnianym")</li>
              <li>Prawo do ograniczenia przetwarzania</li>
              <li>Prawo do przenoszenia danych</li>
              <li>Prawo do wniesienia sprzeciwu wobec przetwarzania</li>
              <li>Prawo do wycofania zgody w dowolnym momencie</li>
              <li>
                Prawo do wniesienia skargi do Prezesa Urzędu Ochrony Danych
                Osobowych (ul. Stawki 2, 00-193 Warszawa)
              </li>
            </ul>
            <p className="mt-3">
              Aby skorzystać z powyższych praw, prosimy o kontakt z
              Administratorem pod adresem:{' '}
              <strong className="text-white">[ADRES-EMAIL-KONTAKTOWY]</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              9. Pliki cookies
            </h2>
            <p className="mb-3">
              Aplikacja wykorzystuje pliki cookies wyłącznie w celach
              technicznych — do utrzymania sesji zalogowanego użytkownika.
              Nie stosujemy cookies marketingowych, reklamowych ani
              analitycznych.
            </p>
            <p>
              Użytkownik może samodzielnie zarządzać plikami cookies w
              ustawieniach przeglądarki. Wyłączenie cookies technicznych może
              uniemożliwić korzystanie z Aplikacji.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              10. Zmiany Polityki prywatności
            </h2>
            <p>
              Zastrzegamy sobie prawo do zmiany niniejszej Polityki. O
              istotnych zmianach użytkownicy zostaną poinformowani z
              odpowiednim wyprzedzeniem — drogą e-mailową lub poprzez komunikat
              w Aplikacji.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              11. Kontakt
            </h2>
            <p>
              W sprawach dotyczących ochrony danych osobowych prosimy o kontakt
              z Administratorem pod adresem:{' '}
              <strong className="text-white">[ADRES-EMAIL-KONTAKTOWY]</strong>
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