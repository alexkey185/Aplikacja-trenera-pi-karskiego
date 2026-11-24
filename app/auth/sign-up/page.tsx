// app/auth/sign-up/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const router = useRouter();
  
  const supabase = createClient();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error('Błąd rejestracji', { description: error.message });
      setIsLoading(false);
      return;
    }

    toast.success('Konto zostało utworzone! Sprawdź e-mail, aby potwierdzić.');
    router.push('/auth/login');
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error('Błąd Google', { description: error.message });
      setIsGoogleLoading(false);
    }
  };

  // Style zapisane w obiektach (zabezpieczenie przed brakiem Tailwinda)
  const styles = {
    container: { minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', padding: '1rem', fontFamily: 'system-ui, sans-serif' },
    card: { width: '100%', maxWidth: '400px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
    heading: { fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' as const, marginBottom: '0.5rem', marginTop: 0 },
    subheading: { fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' as const, marginBottom: '2rem', marginTop: 0 },
    googleBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold', padding: '0.75rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', marginBottom: '1.5rem' },
    dividerWrapper: { position: 'relative' as const, marginBottom: '1.5rem', textAlign: 'center' as const },
    dividerLine: { position: 'absolute' as const, top: '50%', left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.1)' },
    dividerText: { position: 'relative' as const, backgroundColor: '#0f172a', padding: '0 0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' as const, marginBottom: '0.375rem' },
    input: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', color: '#ffffff', outline: 'none', boxSizing: 'border-box' as const },
    submitBtn: { width: '100%', backgroundColor: '#22c55e', color: '#ffffff', fontWeight: 'bold', padding: '0.75rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' },
    footer: { textAlign: 'center' as const, fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginTop: '1.5rem' },
    link: { color: '#4ade80', fontWeight: 600, textDecoration: 'none' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Zarejestruj się</h1>
        <p style={styles.subheading}>Utwórz nowe konto trenera</p>

        {/* PRZYCISK GOOGLE */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          style={styles.googleBtn}
        >
          {isGoogleLoading ? (
            <span style={{ display: 'inline-block', width: '1.25rem', height: '1.25rem', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          <span>Kontynuuj z Google</span>
        </button>

        <div style={styles.dividerWrapper}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>lub</span>
        </div>

        {/* FORMULARZ E-MAIL */}
        <form onSubmit={handleEmailSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={styles.label}>Imię i nazwisko</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jan Kowalski"
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            style={{ ...styles.submitBtn, opacity: (isLoading || isGoogleLoading) ? 0.5 : 1 }}
          >
            {isLoading ? 'Tworzenie konta...' : 'Utwórz konto'}
          </button>
        </form>

        <div style={styles.footer}>
          Masz już konto?{' '}
          <Link href="/auth/login" style={styles.link}>
            Zaloguj się
          </Link>
        </div>
      </div>
    </div>
  );
}