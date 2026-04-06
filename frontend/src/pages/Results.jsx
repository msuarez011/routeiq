import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

export default function Results() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [distance, setDistance] = useState(0);
  const [currency, setCurrency] = useState('COP');

  useEffect(() => {
    const body = {
      origin_lat: parseFloat(params.get('origin_lat')),
      origin_lng: parseFloat(params.get('origin_lng')),
      dest_lat:   parseFloat(params.get('dest_lat')),
      dest_lng:   parseFloat(params.get('dest_lng')),
      city_id:    params.get('city_id'),
      currency:   params.get('currency') || 'COP',
    };
    setCurrency(body.currency);

    fetch(`${API}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(r => r.json())
      .then(data => {
        setResults(data.results || []);
        setDistance(data.distance_km || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al buscar opciones');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
      Buscando opciones...
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', color: 'var(--color-danger)' }}>{error}</div>
  );

  return (
    <div style={{ padding: '1rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'transparent', border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)', padding: '6px 12px',
          color: 'var(--color-text-secondary)', fontSize: 13,
        }}>
          ← Volver
        </button>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
          {distance} km · {results.length} opciones
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map(r => (
          <div key={r.operator_id} style={{
            background: r.badge === 'cheapest' ? '#0A1A14' : 'var(--color-surface)',
            border: `0.5px solid ${r.badge === 'cheapest' ? '#00E8B060' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: r.color_hex, flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 500, fontSize: 15 }}>{r.operator_name}</span>
                {r.badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: r.badge === 'cheapest' ? '#00E8B020' : r.badge === 'fastest' ? '#378ADD20' : '#27AE6020',
                    color: r.badge === 'cheapest' ? '#00E8B0' : r.badge === 'fastest' ? '#378ADD' : '#27AE60',
                    border: `0.5px solid ${r.badge === 'cheapest' ? '#00E8B040' : r.badge === 'fastest' ? '#378ADD40' : '#27AE6040'}`,
                  }}>
                    {r.badge === 'cheapest' ? 'MEJOR PRECIO' : r.badge === 'fastest' ? 'MÁS RÁPIDO' : 'ECO'}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                ~{r.estimated_minutes} min
                {r.nearest_stop && ` · Parada: ${r.nearest_stop.name} (${r.walk_to_stop_m}m)`}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 17, fontWeight: 700,
                color: r.badge === 'cheapest' ? 'var(--color-accent)' : 'var(--color-text-primary)',
              }}>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency', currency,
                  maximumFractionDigits: 0,
                }).format(r.estimated_price)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}