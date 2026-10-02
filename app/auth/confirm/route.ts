import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// ═══════════════════════════════════════════════════════════
// Dozwolone typy OTP
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
// Domyślne ścieżki zależne od typu OTP
// — recovery (reset hasła) idzie na update-password
// — reszta idzie na dashboard
// ═══════════════════════════════════════════════════════════
function getDefaultNext(type: EmailOtpType | null): string {
  if (type === 'recovery') return '/auth/update-password';
  if (type === 'email_change' || type === 'email') return '/profil';
  return '/dashboard';
}

// ═══════════════════════════════════════════════════════════
// Bezpieczna walidacja parametru `next`
// — obsługuje też pełne URL-e z naszego hosta (wyciąga ścieżkę)
// — blokuje open redirect, javascript:, data: itp.
// ═══════════════════════════════════════════════════════════
function safeNext(rawNext: string | null, type: EmailOtpType | null): string {
  const fallback = getDefaultNext(type);

  if (!rawNext) return fallback;

  let candidate = rawNext;

  // Jeśli pełny URL — zaakceptuj tylko jeśli host jest nasz
  if (/^https?:\/\//i.test(rawNext)) {
    try {
      const url = new URL(rawNext);
      const allowedHosts = new Set([
        'talentapp.pl',
        'www.talentapp.pl',
        'localhost:3000',
        'localhost:3001',
      ]);
      if (!allowedHosts.has(url.host)) {
        return fallback;
      }
      candidate = url.pathname + url.search + url.hash;
    } catch {
      return fallback;
    }
  }

  // Musi zaczynać się od pojedynczego "/"
  if (!candidate.startsWith('/')) return fallback;

  // Blokuj "//" (protocol-relative) i "/\"
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback;

  // Blokuj cokolwiek z "://"
  if (candidate.includes('://')) return fallback;

  // Blokuj próby javascript:, data:, vbscript: itp.
  const lowered = candidate.toLowerCase();
  if (
    lowered.includes('javascript:') ||
    lowered.includes('data:') ||
    lowered.includes('vbscript:')
  ) {
    return fallback;
  }

  return candidate;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const rawType = searchParams.get('type');
  const rawNext = searchParams.get('next');

  const type =
    rawType && ALLOWED_TYPES.has(rawType as EmailOtpType)
      ? (rawType as EmailOtpType)
      : null;

  const next = safeNext(rawNext, type);

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      redirect(next);
    }

    redirect(
      `/auth/error?error=${encodeURIComponent(
        error?.message ?? 'Weryfikacja nie powiodła się',
      )}`,
    );
  }

  redirect(
    `/auth/error?error=${encodeURIComponent(
      'Brak tokenu lub nieprawidłowy typ',
    )}`,
  );
}