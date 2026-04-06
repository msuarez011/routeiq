import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate          = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>
        Perfil
      </h2>

      <div style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>
          Correo
        </div>
        <div style={{ fontWeight: 500 }}>{user?.email}</div>
      </div>

      <div style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>
          ID de usuario
        </div>
        <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
          {user?.id}
        </div>
      </div>

      <button onClick={handleSignOut} style={{
        width: '100%', padding: '12px',
        background: 'transparent',
        border: '0.5px solid var(--color-danger)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-danger)',
        fontWeight: 500, fontSize: 15,
      }}>
        Cerrar sesión
      </button>
    </div>
  );
}