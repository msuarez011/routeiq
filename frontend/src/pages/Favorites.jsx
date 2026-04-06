import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetch(`${API}/api/favorites`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(r => r.json())
        .then(data => { setFavorites(data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [user]);

  async function remove(id) {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${API}/api/favorites/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setFavorites(prev => prev.filter(f => f.id !== id));
  }

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>Cargando...</div>
  );

  return (
    <div style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>
        Favoritos
      </h2>
      {favorites.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No tienes favoritos guardados.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {favorites.map(f => (
            <div key={f.id} style={{
              background: 'var(--color-surface)',
              border: '0.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {f.lat.toFixed(4)}, {f.lng.toFixed(4)}
                </div>
              </div>
              <button onClick={() => remove(f.id)} style={{
                background: 'transparent',
                border: '0.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                color: 'var(--color-danger)', fontSize: 13,
              }}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}