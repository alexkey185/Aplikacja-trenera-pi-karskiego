import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getActiveDruzyna } from '@/lib/druzyny';
import { wyloguj } from './actions';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';
import { ClubLogoUpload } from '@/components/ClubLogoUpload';
import { PageHeaderLogo } from '@/components/PageHeaderLogo';
import { TopBar } from '@/components/TopBar';
import { ProfilForm } from './ProfilForm';
import {
  User,
  Mail,
  Calendar as CalendarIcon,
  Shield,
  Info,
  LogOut,
  AlertTriangle,
  MessageSquare,
  Check,
  Download,
  HardDrive,
} from 'lucide-react';

export default async function Profil() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const activeDruzyna = await getActiveDruzyna();

  const { data: consent } = await supabase
    .from('user_consents')
    .select('terms_version, privacy_version, accepted_at')
    .eq('user_id', user.id)
    .maybeSingle();

  const email = user.email ?? 'brak';
  const imie = user.user_metadata?.imie ?? '';
  const nazwisko = user.user_metadata?.nazwisko ?? '';
  const inicjal = (imie?.charAt(0) || email.charAt(0)).toUpperCase();

  const dataUtworzenia = user.created_at
    ? new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(user.created_at))
    : '—';

  const ostatnieLogowanie = user.last_sign_in_at
    ? new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(user.last_sign_in_at))
    : '—';

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center gap-3 animate-fadeIn">
        <PageHeaderLogo icon={User} logoUrl={activeDruzyna?.logo_url ?? null} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">
            Profil
          </h1>
          <p className="text-xs text-white/70 font-medium mt-0.5 drop-shadow">
            Twoje konto i ustawienia
          </p>
        </div>
        <TopBar />
      </header>

      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4 animate-fadeIn shadow-2xl shadow-black/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 rounded-full blur-lg opacity-60" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center font-bold text-white text-3xl shadow-2xl">
              {inicjal}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {imie || nazwisko ? (
              <>
                <div className="text-lg font-bold text-white truncate drop-shadow">
                  {imie} {nazwisko}
                </div>
                <div className="text-xs text-white/60 truncate mt-0.5">{email}</div>
              </>
            ) : (
              <>
                <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">
                  Zalogowany jako
                </div>
                <div className="font-bold text-white text-lg truncate drop-shadow">
                  {email}
                </div>
              </>
            )}
            <div className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-green-400" />
              Konto trenera
            </div>
          </div>
        </div>
      </div>

      {activeDruzyna && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4 animate-fadeIn shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-green-400" />
            <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
              Logo klubu ({activeDruzyna.nazwa})
            </h3>
          </div>
          <ClubLogoUpload currentLogo={activeDruzyna.logo_url} />
        </div>
      )}

      <ProfilForm imie={imie} nazwisko={nazwisko} />

      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden mb-4 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="p-5">
          <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            Informacje o koncie
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                  Email
                </div>
                <div className="text-sm text-white truncate">{email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-4 h-4 text-purple-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                  Konto utworzone
                </div>
                <div className="text-sm text-white truncate">{dataUtworzenia}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-4 h-4 text-green-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                  Ostatnie logowanie
                </div>
                <div className="text-sm text-white truncate">
                  {ostatnieLogowanie}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-4 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-3.5 h-3.5 text-green-400" />
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
            Zgody i dokumenty
          </h3>
        </div>

        {consent ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-white/5">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Regulamin</div>
                <div className="text-[10px] text-white/50">
                  Zaakceptowany{' '}
                  {new Intl.DateTimeFormat('pl-PL', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date(consent.accepted_at))}
                </div>
              </div>
              <div className="text-[10px] font-bold text-green-400 bg-green-500/15 border border-green-400/30 px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                <Check className="w-2.5 h-2.5" strokeWidth={3} />v
                {consent.terms_version}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-white/5">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">
                  Polityka prywatności
                </div>
                <div className="text-[10px] text-white/50">
                  Zaakceptowana{' '}
                  {new Intl.DateTimeFormat('pl-PL', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date(consent.accepted_at))}
                </div>
              </div>
              <div className="text-[10px] font-bold text-green-400 bg-green-500/15 border border-green-400/30 px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                <Check className="w-2.5 h-2.5" strokeWidth={3} />v
                {consent.privacy_version}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-white/50 py-3 text-center">
            Brak zapisanej zgody. Skontaktuj się z administratorem.
          </div>
        )}
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-4 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
            Dane i prywatność
          </h3>
        </div>
        <p className="text-xs text-white/60 mb-4 leading-relaxed">
          Pobierz kopię zapasową swojej drużyny — wszyscy zawodnicy, treningi i
          historia obecności w jednym pliku JSON. Zapisz na dysku lub w chmurze.
        </p>
        <a
          href="/api/export/backup"
          download
          className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 hover:border-blue-400/50 text-blue-200 hover:text-blue-100 font-semibold py-3 rounded-xl text-xs transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Pobierz kopię zapasową (JSON)
        </a>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-4 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">
            Pomoc i opinie
          </h3>
        </div>
        <p className="text-xs text-white/60 mb-4 leading-relaxed">
          Znalazłeś błąd? Masz pomysł na nową funkcję? Napisz — to pomaga ulepszyć
          aplikację.
        </p>
        <Link
          href="/profil/pomoc"
          className="w-full flex items-center justify-center gap-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 text-blue-200 font-semibold py-3 rounded-xl text-xs transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Zgłoś problem / pomysł
        </Link>
      </div>

      <form action={wyloguj} className="animate-fadeIn mb-4">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-semibold py-3.5 rounded-2xl text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          Wyloguj się
        </button>
      </form>

      <div className="bg-red-500/[0.03] backdrop-blur-md border border-red-400/20 rounded-3xl p-5 animate-fadeIn shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-bold text-red-400/90 uppercase tracking-widest">
            Strefa niebezpieczna
          </h3>
        </div>
        <p className="text-xs text-white/50 mb-4 leading-relaxed">
          Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane (zawodnicy,
          treningi, obecności) zostaną trwale usunięte.{' '}
          <strong className="text-white/70">
            Przed usunięciem pobierz kopię zapasową.
          </strong>
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}