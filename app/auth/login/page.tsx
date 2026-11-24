import Link from 'next/link';
import { GoogleSignInButton } from '@/components/GoogleSignInButton'; // <-- Upewnij się, że ścieżka jest poprawna!

export default function LoginPage() {
  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '16px',
      padding: '32px',
      color: '#ffffff',
      margin: '40px auto',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>
          Zaloguj się
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          Wróć do zarządzania drużyną
        </p>
      </div>

      {/* PRZYCISK GOOGLE */}
      <div style={{ marginBottom: '24px' }}>
        <GoogleSignInButton />
      </div>

      {/* SEPARATOR "LUB" */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }} />
        <span style={{ padding: '0 12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>lub</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }} />
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
            E-mail
          </label>
          <input 
            type="email" 
            placeholder="jan@example.com" 
            style={{
              width: '100%',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px',
              color: '#ffffff',
              outline: 'none',
            }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
            Hasło
          </label>
          <input 
            type="password" 
            placeholder="••••••••" 
            style={{
              width: '100%',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px',
              color: '#ffffff',
              outline: 'none',
            }} 
          />
        </div>

        <button 
          type="submit" 
          style={{
            width: '100%',
            backgroundColor: '#22c55e', // Możesz zmienić na niebieski (#3b82f6) dla logowania, jeśli wolisz
            color: '#ffffff',
            fontWeight: 'bold',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          Zaloguj się
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginTop: '24px' }}>
        Nie masz konta?{' '}
        <Link href="/auth/sign-up" style={{ color: '#22c55e', fontWeight: '600', textDecoration: 'none' }}>
          Zarejestruj się
        </Link>
      </p>
    </div>
  );
}