import Link from 'next/link';

// Prosta, ładna ikonka Google jako komponent SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.27C21.35 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
      <path d="M12 23C14.97 23 17.46 22.02 19.27 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.84 14.09H2.17V16.94C3.99 20.56 7.7 23 12 23Z" fill="#34A853"/>
      <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.06H2.17C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.17 16.94L5.84 14.09Z" fill="#FBBC05"/>
      <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.34 3.88C17.45 2.13 14.97 1 12 1C7.7 1 3.99 3.44 2.17 7.06L5.84 9.91C6.7 7.31 9.13 5.38 12 5.38Z" fill="#EA4335"/>
    </svg>
  );
}

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

      {/* ŁADNY PRZYCISK GOOGLE */}
      <button 
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          color: '#ffffff',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          marginBottom: '24px',
          transition: 'background-color 0.2s'
        }}
      >
        <GoogleIcon />
        Kontynuuj z Google
      </button>

      {/* SEPARATOR "LUB" */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }} />
        <span style={{ padding: '0 12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>lub</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }} />
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
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
              fontSize: '14px'
            }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
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
              fontSize: '14px'
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
            fontSize: '15px'
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