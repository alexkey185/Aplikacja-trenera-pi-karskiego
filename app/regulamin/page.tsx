import { BackButton } from '@/components/BackButton';

export const metadata = {
  title: 'Regulamin - Talent',
  description:
    'Regulamin korzystania z aplikacji Talent do zarządzania drużyną piłkarską',
};

export default function Regulamin() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <BackButton />

        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Regulamin
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Ostatnia aktualizacja: 7 października 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              1. Postanowienia ogólne
            </h2>
            <p className="mb-3">
              Niniejszy Regulamin określa zasady korzystania z aplikacji
              internetowej <strong className="text-white">Talent</strong>{' '}
              (dalej: „Aplikacja"), dostępnej pod adresem{' '}
              <strong className="text-white">https://talentapp.pl.pl</strong>,
              służącej trenerom piłki nożnej do zarządzania drużyną, planowania
              treningów oraz prowadzenia ewidencji obecności.
            </p>
            <p className="mb-3">
              Operatorem i właścicielem Aplikacji (dalej: „Operator") jest:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Adam Pilny</strong>
              </li>
              <li>
                E-mail:{' '}
                <strong className="text-white">kontakt@talentapp.pl</strong>
              </li>
            </ul>
            <p className="mt-3">
              Korzystanie z Aplikacji oznacza pełną akceptację postanowień
              niniejszego Regulaminu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Definicje</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Aplikacja</strong> - serwis
                internetowy „Talent" działający pod adresem wskazanym w pkt 1.
              </li>
              <li>
                <strong className="text-white">Użytkownik</strong> - osoba
                fizyczna (trener), która utworzyła konto w Aplikacji.
              </li>
              <li>
                <strong className="text-white">Konto</strong> - indywidualny
                dostęp do Aplikacji chroniony adresem e-mail i hasłem.
              </li>
              <li>
                <strong className="text-white">Zawodnik</strong> - osoba
                niepełnoletnia wpisana przez Użytkownika do ewidencji drużyny.
              </li>
              <li>
                <strong className="text-white">Drużyna</strong> - zbiór
                zawodników zgrupowanych pod kontem jednego Użytkownika.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Zakres usług</h2>
            <p className="mb-3">Aplikacja umożliwia w szczególności:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tworzenie i prowadzenie listy zawodników drużyny</li>
              <li>Planowanie treningów, meczów, sparingów i turniejów</li>
              <li>Ustawianie wydarzeń cyklicznych (np. trening co tydzień)</li>
              <li>Ewidencję obecności zawodników na treningach</li>
              <li>Śledzenie statystyk frekwencji drużyny</li>
              <li>Eksport planu tygodnia do pliku PDF</li>
            </ul>
            <p className="mt-3">
              Operator zastrzega sobie prawo do zmiany zakresu usług,
              rozszerzania funkcjonalności oraz czasowego wyłączenia Aplikacji
              w celu przeprowadzenia prac technicznych.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              4. Rejestracja i konto Użytkownika
            </h2>
            <p className="mb-3">
              4.1. Korzystanie z Aplikacji wymaga utworzenia konta. Konto
              zakłada się poprzez rejestrację z użyciem adresu e-mail i hasła.
            </p>
            <p className="mb-3">4.2. Warunkiem utworzenia konta jest:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ukończenie 18 lat przez Użytkownika</li>
              <li>Podanie prawdziwego adresu e-mail</li>
              <li>Akceptacja Regulaminu i Polityki prywatności</li>
            </ul>
            <p className="mt-3 mb-3">4.3. Użytkownik zobowiązany jest do:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nieudostępniania danych logowania osobom trzecim</li>
              <li>
                Niezwłocznego informowania Operatora o podejrzeniu
                nieautoryzowanego dostępu do konta
              </li>
              <li>Wprowadzania danych zgodnych z prawdą</li>
              <li>
                Przestrzegania przepisów RODO wobec danych osobowych zawodników
                - uzyskania zgody rodziców/opiekunów przed wprowadzeniem danych
                dziecka do Aplikacji
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              5. Obowiązki Użytkownika
            </h2>
            <p className="mb-3">Zabronione jest:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Wykorzystywanie Aplikacji do celów niezgodnych z prawem lub
                niniejszym Regulaminem
              </li>
              <li>
                Wprowadzanie danych osób trzecich bez zgody tych osób lub ich
                opiekunów prawnych
              </li>
              <li>
                Podejmowanie prób uzyskania nieautoryzowanego dostępu do danych
                innych Użytkowników
              </li>
              <li>
                Udostępnianie konta wielu osobom jednocześnie lub jego
                odsprzedaż
              </li>
              <li>
                Kopiowanie, modyfikowanie i rozpowszechnianie treści Aplikacji
                bez zgody Operatora
              </li>
              <li>
                Prowadzenie działań zakłócających pracę Aplikacji (ataki DDoS,
                scraping, inżynieria odwrotna)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              6. Odpowiedzialność
            </h2>
            <p className="mb-3">6.1. Operator nie ponosi odpowiedzialności za:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Dane wprowadzone przez Użytkownika i skutki ich wykorzystania
              </li>
              <li>
                Sposób wykorzystania danych zawodników przez Użytkownika (w tym
                brak wymaganych zgód rodziców)
              </li>
              <li>
                Przerwy w działaniu Aplikacji wynikające z awarii dostawców
                infrastruktury, siły wyższej lub działań osób trzecich
              </li>
              <li>
                Utratę danych wynikającą z działań Użytkownika (np. usunięcie
                zawodnika lub treningu)
              </li>
              <li>Skutki nieprawidłowego korzystania z Aplikacji</li>
            </ul>
            <p className="mt-3 mb-3">
              6.2. Użytkownik ponosi pełną odpowiedzialność za:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Zgodność z przepisami RODO wobec danych osobowych zawodników
              </li>
              <li>Uzyskanie zgody rodziców/opiekunów na przetwarzanie danych</li>
              <li>
                Treść danych wprowadzonych do Aplikacji oraz skutki ich
                wykorzystania
              </li>
              <li>
                Bezpieczeństwo swojego konta (w tym hasła i danych dostępowych)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              7. Dostępność usługi
            </h2>
            <p>
              Operator dokłada starań, aby Aplikacja działała nieprzerwanie i
              bezawaryjnie. Zastrzega jednak prawo do czasowego wyłączenia
              Aplikacji w celu przeprowadzenia prac technicznych, aktualizacji
              lub modernizacji. O planowanych przerwach Operator będzie
              informować z odpowiednim wyprzedzeniem - drogą e-mailową lub
              komunikatem w Aplikacji.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              8. Własność intelektualna
            </h2>
            <p>
              Wszystkie elementy Aplikacji - w tym kod źródłowy, wygląd
              graficzny, logo, nazwy, treści oraz układ interfejsu - są
              chronione prawem autorskim i stanowią własność Operatora.
              Kopiowanie, modyfikowanie, rozpowszechnianie, dekompilacja i
              wykorzystywanie komercyjne bez pisemnej zgody Operatora jest
              zabronione.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              9. Rozwiązanie umowy i usunięcie konta
            </h2>
            <p className="mb-3">
              9.1. Użytkownik może w każdej chwili zrezygnować z korzystania z
              Aplikacji. W tym celu powinien skontaktować się z Operatorem w
              celu usunięcia konta i wszystkich danych z nim związanych.
            </p>
            <p className="mb-3">
              9.2. Operator zastrzega sobie prawo do zablokowania lub usunięcia
              konta w przypadku:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Naruszenia postanowień niniejszego Regulaminu</li>
              <li>Podejrzenia działań niezgodnych z prawem</li>
              <li>Długotrwałego braku aktywności (powyżej 24 miesięcy)</li>
            </ul>
            <p className="mt-3">
              9.3. Usunięcie konta wiąże się z trwałym usunięciem wszystkich
              danych Użytkownika i jego drużyny z Aplikacji.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">10. Opłaty</h2>
            <p>
              Korzystanie z Aplikacji jest obecnie bezpłatne. Operator
              zastrzega sobie prawo do wprowadzenia odpłatności za wybrane
              funkcje w przyszłości. O zmianach Użytkownicy zostaną
              poinformowani z co najmniej 30-dniowym wyprzedzeniem. Korzystanie
              z Aplikacji po wprowadzeniu opłat będzie równoznaczne z akceptacją
              nowych warunków lub możliwością rezygnacji z usługi.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              11. Zmiany Regulaminu
            </h2>
            <p>
              Operator zastrzega sobie prawo do zmiany Regulaminu. O istotnych
              zmianach Użytkownicy zostaną poinformowani z co najmniej
              14-dniowym wyprzedzeniem - drogą e-mailową lub poprzez komunikat
              w Aplikacji. Dalsze korzystanie z Aplikacji po wejściu zmian w
              życie oznacza akceptację nowego Regulaminu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">12. Reklamacje</h2>
            <p className="mb-3">
              Reklamacje dotyczące działania Aplikacji można składać na adres
              e-mail:{' '}
              <strong className="text-white">kontakt@talentapp.pl</strong>
            </p>
            <p>
              Reklamacja powinna zawierać: dane Użytkownika, opis problemu oraz
              oczekiwany sposób rozwiązania. Operator rozpatruje reklamacje w
              terminie do 14 dni roboczych od ich otrzymania.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              13. Postanowienia końcowe
            </h2>
            <p>
              W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie
              mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego
              oraz ustawy o świadczeniu usług drogą elektroniczną. Wszelkie
              spory będą rozstrzygane przez sąd właściwy dla siedziby
              Operatora.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">14. Kontakt</h2>
            <p>
              W sprawach związanych z Regulaminem prosimy o kontakt z
              Operatorem pod adresem:{' '}
              <strong className="text-white">kontakt@talentapp.pl</strong>
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