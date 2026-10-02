import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// ═══════════════════════════════════════════════════════════
// Dozwolone typy OTP (supabase EmailOtpType)
// ═══════════════════════════════════════════════════════════
const ALLOWED_TYPES = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

// ═══════════════════════════════════════════════════════════
// Bezpieczna walidacja parametru `next`
// Dopuszczamy TYLKO ścieżki relatywne zaczynające się od "/",
// blokujemy: //, http://, https://, javascript:, data:, itp.
// ═══════════════════════════════════════════════════════════
function safeNext(next: string | null): string {
  if (!next) return '/dashboard';

  // Musi zaczynać się od pojedynczego "/"
  if (!next.startsWith('/')) return '/dashboard';

  // Blokuj "//" (protocol-relative URL) i "/\"
  if (next.startsWith('//') || next.startsWith('/\\')) return '/dashboard';

  // Blokuj cokolwiek z "://" (pełne URL-e)
  if (next.includes('://')) return '/dashboard';

  // Blokuj próby javascript:, data:, vbscript: itp.
  const lowered = next.toLowerCase();
  if (
    lowered.includes('javascript:') ||
    lowered.includes('data:') ||
    lowered.includes('vbscript:')
  ) {
    return '/dashboard';
  }

  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const rawType = searchParams.get('type');
  const rawNext = searchParams.get('next');

  const next = safeNext(rawNext);

  // Walidacja typu — musi być jednym ze znanych wartości
  const type = rawType && ALLOWED_TYPES.has(rawType as EmailOtpType)
    ? (rawType as EmailOtpType)
    : null;

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      redirect(next);
    }

    // Enkodujemy komunikat błędu — nie wpuszczamy surowego tekstu do URL
    redirect(`/auth/error?error=${encodeURIComponent(error?.message ?? 'Weryfikacja nie powiodła się')}`);
  }

  redirect(`/auth/error?error=${encodeURIComponent('Brak tokenu lub nieprawidłowy typ')}`);
}