import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { zaktualizujProfil, wyloguj } from './actions';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';
import {
  User,
  Mail,
  Calendar as CalendarIcon,
  Shield,
  Info,
  Save,
  LogOut,
  AlertTriangle,
  MessageSquare,
  Check,
} from 'lucide-react';

export default async function Profil() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

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
    ? new Date(user.created_at).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const ostatnieLogowanie = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric