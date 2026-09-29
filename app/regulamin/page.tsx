import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Regulamin — Talent',
  description: 'Regulamin korzystania z aplikacji Talent do zarządzania drużyną piłkarską',
};

export default function Regulamin() {
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
          Regulamin
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Ostatnia aktualizacja: 30.09.2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Postanowienia ogólne</h2>
            <p>
              Niniejszy regulamin określa zasady korzystania z aplikacji{' '}
              <strong className="text-white">Talent</strong> — narzędzia wspomagającego
              pracę trenerów drużyn piłkarskich. Korzystanie z aplikacji oznacza
              akceptację postanowień niniejszego regulaminu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Zakres usług</h2>
            <p className="mb-3">Aplikacja umożliwia:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Tworzenie i prowadzenie listy zawodników drużyny</li>
              <li>Planowanie treningów, meczów, sparingów i turniejów</li>
              <li>Ustawianie wydarzeń cyklicznych (np. trening co tydzień)</li>
              <li>Ewidencję obecności zawodników na treningach</li>
              <li>Śledzenie statystyk frekwencji drużyny</li>
              <li>Eksport planu tygodnia do pliku PDF</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Konto użytkownika</h2>
            <p className="mb-3">
              Z aplikacji mogą korzystać wyłącznie zalogowani trenerzy. Konto zakłada się
              poprzez rejestrację z użyciem adresu e-mail.
            </p>
            <p className="mb-3">
              Użytkownik zobowiązany jest do:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Nieudostępniania danych logowania osobom trzecim</li>
              <li>Niezwłocznego informowania o podejrzeniu nieautoryzowanego dostępu</li>
              <li>Wprowadzania prawdziwych danych dotyczących zawodników</li>
              <li>Przestrzegania przepisów RODO wobec danych osobowych zawodników</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Obowiązki użytkownika</h2>
            <p className="mb-3">Zabronione jest:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Wykorzystywanie aplikacji do celów niezgodnych z prawem</li>
              <li>Wprowadzanie danych osób trzecich bez ich zgody</li>
              <li>Próby uzyskania nieautoryzowanego dostępu do danych innych użytkowników</li>
              <li>Udostępnianie konta wielu osobom jednocześnie</li>
              <li>Kopiowanie treści aplikacji bez zgody administratora</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Odpowiedzialność</h2>
            <p className="mb-3">
              Administrator aplikacji nie ponosi odpowiedzialności za:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Dane wprowadzone przez użytkownika i skutki ich wykorzystania</li>
              <li>Sposób wykorzystania danych zawodników przez trenera</li>
              <li>Przerwy w działaniu aplikacji wynikające z awarii dostawców infrastruktury</li>
              <li>Utratę danych wynikającą z działania użytkownika (np. usunięcie zawodnika)</li>
            </ul>
            <p className="mt-3">
              Użytkownik ponosi pełną odpowiedzialność za przestrzeganie przepisów RODO
              wobec danych osobowych zawodników, których dane wprowadza do aplikacji.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">6. Dostępność usługi</h2>
            <p>
              Dokładamy starań, aby aplikacja działała nieprzerwanie. Zastrzegamy jednak
              prawo do czasowego wyłączenia aplikacji w celu przeprowadzenia prac
              technicznych lub aktualizacji. O planowanych przerwach będziemy informować
              z wyprzedzeniem.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">7. Własność intelektualna</h2>
            <p>
              Wszystkie elementy aplikacji — w tym kod źródłowy, wygląd, logo oraz treści
              — są chronione prawem autorskim. Kopiowanie, modyfikowanie i rozpowszechnianie
              bez zgody administratora jest zabronione.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">8. Rozwiązanie umowy</h2>
            <p>
              Użytkownik może w każdej chwili zrezygnować z korzystania z aplikacji.
              W tym celu należy skontaktować się z administratorem w celu usunięcia konta
              i danych. Administrator zastrzega sobie prawo do zablokowania konta w
              przypadku naruszenia regulaminu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">9. Zmiany regulaminu</h2>
            <p>
              Zastrzegamy sobie prawo do zmiany regulaminu. O istotnych zmianach
              użytkownicy zostaną poinformowani z co najmniej 7-dniowym wyprzedzeniem
              drogą e-mailową lub poprzez komunikat w aplikacji.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">10. Postanowienia końcowe</h2>
            <p>
              W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają
              przepisy prawa polskiego. Wszelkie spory będą rozstrzygane przez sąd
              właściwy dla siedziby administratora.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">11. Kontakt</h2>
            <p>
              W sprawach związanych z regulaminem prosimy o kontakt z administratorem
              aplikacji.
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