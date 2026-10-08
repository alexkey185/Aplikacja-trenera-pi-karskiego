import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ═══════════════════════════════════════════════════════════
// Callback OAuth (Google) — PKCE flow
//
// Google → Supabase → TU (z ?code=...)
// Wymieniamy code na sesję i przekierowujemy usera dalej.
//
// Uwaga: to NIE jest to samo co /auth/confirm (maile z token_hash).
// ═══════════════════════════════════════════════════════════

// Bezpieczna walidacja parametru `next` (identyczna jak w /auth/confirm)
function safeNext(rawNext: string | null): string {
  const fallback = '/dashboard';
  if (!rawNext) return fallback;

  let candidate = rawNext;

  if (/^https?:\/\//i.test(rawNext)) {
    try {
      const url = new URL(rawNext);
      const allowedHosts = new Set([
        'talentapp.pl',
        'www.talentapp.pl',
        'localhost:3000',
        'localhost:3001',
      ]);
      if (!allowedHosts.has(url.host)) return fallback;
      candidate = url.pathname + url.search + url.hash;
    } catch {
      return fallback;
    }
  }

  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback;
  if (candidate.includes('://')) return fallback;

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
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  // ═══════════════════════════════════════════════════════
  // Fix dla Vercel preview deployments:
  // url.origin zwraca wewnętrzny hostname Vercel, nie deployment URL.
  // x-forwarded-host to poprawny host publiczny.
  // ═══════════════════════════════════════════════════════
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocal = process.env.NODE_ENV === 'development';
  const baseUrl = isLocal
    ? origin
    : forwardedHost
    ? `https://${forwardedHost}`
    : origin;

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/auth/error?error=${encodeURIComponent('Brak kodu autoryzacji')}`
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${baseUrl}/auth/error?error=${encodeURIComponent(error.message)}`
    );
  }

  // Sukces — sesja w cookies, przekieruj dalej
  return NextResponse.redirect(`${baseUrl}${next}`);
}