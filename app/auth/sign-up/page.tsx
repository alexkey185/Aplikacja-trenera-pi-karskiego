import Link from 'next/link';

export default function SignUpPage() {
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
          Zarejestruj się
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          Utwórz nowe konto trenera
        </p>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
            Imię i nazwisko
          </label>
          <input 
            type="text" 
            placeholder="Jan Kowalski" 
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
            backgroundColor: '#22c55e',
            color: '#ffffff',
            fontWeight: 'bold',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          Utwórz konto
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginTop: '24px' }}>
        Masz już konto?{' '}
        <Link href="/auth/login" style={{ color: '#22c55e', fontWeight: '600', textDecoration: 'none' }}>
          Zaloguj się
        </Link>
      </p>
    </div>
  );
}