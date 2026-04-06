import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [tab, setTab]       = useState('login');
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoad]  = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate           = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoad(true);
    try {
      const { error } = tab === 'login'
        ? await signIn(email, password)
        : await signUp(email, password);
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoad(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem', width: '100%', maxWidth: 400,
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: '1.5rem' }}>
          RouteIQ
        </h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: '0.5px solid var(--color-border)',
              background: tab === t ? 'var(--color-accent)' : 'transparent',
              color: tab === t ? '#0A1A14' : 'var(--color-text-secondary)',
              fontWeight: tab === t ? 700 : 400,
            }}>
              {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email" placeholder="Correo electrónico"
            value={email} onChange={e => setEmail(e.target.value)} required
          />
          <input
            type="password" placeholder="Contraseña"
            value={password} onChange={e => setPass(e.target.value)} required
          />
          {error && (
            <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>
          )}
          <button type="submit" disabled={loading} style={{
            padding: '12px',
            background: 'var(--color-accent)',
            color: '#0A1A14', fontWeight: 700,
            border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: 15, marginTop: 8,
          }}>
            {loading ? 'Cargando...' : tab === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}