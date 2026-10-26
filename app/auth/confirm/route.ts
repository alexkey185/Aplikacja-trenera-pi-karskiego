import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ensureConsentRecord } from '@/lib/consents';
import { safeNext as safeNextBase } from '@/lib/auth/safe-redirect';

const ALLOWED_TYPES = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

function getDefaultNext(type: EmailOtpType | null): string {
  if (type === 'recovery') return '/auth/update-password';
  if (type === 'email_change' || type === 'email') return '/profil';
  return '/dashboard';
}

function safeNext(rawNext: string | null, type: EmailOtpType | null): string {
  return safeNextBase(rawNext, getDefaultNext(type));
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
      await ensureConsentRecord();
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