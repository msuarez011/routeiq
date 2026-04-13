import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCity } from '../context/CityContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useOperators } from '../hooks/useOperators';
import { useDebouncedCallback } from 'use-debounce';

const API = import.meta.env.VITE_API_URL;

export default function Home() {
  const { activeCity, cities, setActiveCity } = useCity();
  const { position, error: geoError }         = useGeolocation();
  const { operators, loading: opsLoading }     = useOperators(activeCity?.id);
  const navigate  = useNavigate();
  const inputRef  = useRef(null);

  const [dest, setDest]           = useState('');
  const [destCoords, setCoords]   = useState(null);
  const [suggestions, setSuggest] = useState([]);
  const [currency, setCurrency]   = useState(activeCity?.currency_code || 'COP');
  const [prices, setPrices]       = useState({});
  const [searching, setSearching] = useState(false);
  const [sheet, setSheet]         = useState('browse');

  useEffect(() => {
    if (activeCity) setCurrency(activeCity.currency_code || 'COP');
  }, [activeCity]);

  const searchDestination = useDebouncedCallback(async (query) => {
    if (query.length < 3) { setSuggest([]); return; }
    try {
      const city = activeCity?.name || 'Cali';
      const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' ' + city)}&format=json&limit=4&addressdetails=1`;
      const res  = await fetch(url, { headers: { 'Accept-Language': 'es' } });
      const data = await res.json();
      setSuggest(data);
    } catch { setSuggest([]); }
  }, 400);

  function selectSuggestion(place) {
    setDest(place.display_name.split(',').slice(0, 2).join(','));
    setCoords({ lat: parseFloat(place.lat), lng: parseFloat(place.lon) });
    setSuggest([]);
    if (position && activeCity) fetchPrices(parseFloat(place.lat), parseFloat(place.lon));
  }

  async function fetchPrices(dLat, dLng) {
    if (!position || !activeCity) return;
    setSearching(true);
    setSheet('results');
    try {
      const res  = await fetch(`${API}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_lat: position.lat, origin_lng: position.lng,
          dest_lat: dLat, dest_lng: dLng,
          city_id: activeCity.id, currency,
        }),
      });
      const data = await res.json();
      const map  = {};
      (data.results || []).forEach(r => { map[r.operator_id] = r; });
      setPrices(map);
    } catch { } finally { setSearching(false); }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!destCoords) return;
    fetchPrices(destCoords.lat, destCoords.lng);
  }

  const sorted = [...operators].sort((a, b) => {
    const pa = prices[a.id]?.estimated_price ?? Infinity;
    const pb = prices[b.id]?.estimated_price ?? Infinity;
    return pa - pb;
  });

  const cheapestId = sorted.find(o => prices[o.id])?.id;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* TOP BAR */}
      <div style={{
        padding: '1rem',
        background: 'var(--color-bg)',
        borderBottom: '0.5px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 700, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, whiteSpace: 'nowrap' }}>
            Route<span style={{ color: 'var(--color-accent)' }}>IQ</span>
          </span>

          <div style={{ flex: 1, position: 'relative' }}>
            <form onSubmit={handleSearch}>
              <input
                ref={inputRef}
                placeholder="¿A dónde vas?"
                value={dest}
                onChange={e => { setDest(e.target.value); searchDestination(e.target.value); }}
                style={{ paddingRight: 40 }}
              />
            </form>
            {dest && (
              <button onClick={() => { setDest(''); setCoords(null); setSuggest([]); setPrices({}); setSheet('browse'); }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 16 }}>
                ✕
              </button>
            )}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, right: 0,
                background: 'var(--color-surface)', border: '0.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', zIndex: 100, overflow: 'hidden',
              }}>
                {suggestions.map((s, i) => (
                  <div key={i} onClick={() => selectSuggestion(s)} style={{
                    padding: '10px 14px', fontSize: 13,
                    color: 'var(--color-text-secondary)',
                    borderBottom: i < suggestions.length - 1 ? '0.5px solid var(--color-border)' : 'none',
                    cursor: 'pointer',
                  }}>
                    {s.display_name.split(',').slice(0, 3).join(', ')}
                  </div>
                ))}
              </div>
            )}
          </div>

          <select value={activeCity?.id || ''} onChange={e => setActiveCity(cities.find(c => c.id === e.target.value))}
            style={{ width: 'auto', minWidth: 90, fontSize: 13 }}>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={currency} onChange={e => setCurrency(e.target.value)}
            style={{ width: 'auto', minWidth: 70, fontSize: 13 }}>
            <option value="COP">COP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* LOCATION STATUS */}
      <div style={{ padding: '8px 1rem', background: 'var(--color-surface2)', borderBottom: '0.5px solid var(--color-border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: position ? 'var(--color-accent)' : 'var(--color-warning)', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text-muted)' }}>
            {position ? `Tu ubicación: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : geoError || 'Obteniendo ubicación...'}
          </span>
        </div>
      </div>

      {/* SHEET TABS */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--color-border)', background: 'var(--color-bg)' }}>
        {['browse', 'results'].map(t => (
          <button key={t} onClick={() => setSheet(t)} style={{
            flex: 1, padding: '12px', fontSize: 13, fontWeight: sheet === t ? 500 : 400,
            background: 'transparent', border: 'none',
            color: sheet === t ? 'var(--color-accent)' : 'var(--color-text-muted)',
            borderBottom: sheet === t ? `2px solid var(--color-accent)` : '2px solid transparent',
          }}>
            {t === 'browse' ? 'Opciones disponibles' : destCoords ? 'Comparar precios' : 'Comparar precios'}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: '1rem', maxWidth: 700, margin: '0 auto', width: '100%' }}>

        {sheet === 'browse' && (
          <>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              {opsLoading ? 'Cargando operadores...' : `${operators.length} opciones en ${activeCity?.name || '...'}`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {operators.map(op => (
                <div key={op.id} style={{
                  background: 'var(--color-surface)',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: op.color_hex, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{op.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {op.type.replace('_', ' ')} · tarifa base: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(op.base_fare || 0)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', background: 'var(--color-surface2)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                    {op.is_realtime ? 'tiempo real' : 'estimado'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {sheet === 'results' && (
          <>
            {searching ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
                Calculando rutas...
              </div>
            ) : Object.keys(prices).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                <p>Escribe un destino para ver los precios</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sorted.filter(op => prices[op.id]).map(op => {
                  const r  = prices[op.id];
                  const isBest = op.id === cheapestId;
                  return (
                    <div key={op.id} style={{
                      background: isBest ? '#0A1A14' : 'var(--color-surface)',
                      border: `0.5px solid ${isBest ? '#00E8B060' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: op.color_hex, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 500, fontSize: 15 }}>{op.name}</span>
                          {isBest && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#00E8B020', color: '#00E8B0', border: '0.5px solid #00E8B040' }}>
                              MEJOR PRECIO
                            </span>
                          )}
                          {r.badge === 'fastest' && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#378ADD20', color: '#378ADD', border: '0.5px solid #378ADD40' }}>
                              MÁS RÁPIDO
                            </span>
                          )}
                          {r.badge === 'eco' && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#27AE6020', color: '#27AE60', border: '0.5px solid #27AE6040' }}>
                              ECO
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          ~{r.estimated_minutes} min · {r.distance_km} km
                          {r.nearest_stop && ` · Parada: ${r.nearest_stop.name} (${r.walk_to_stop_m}m)`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: isBest ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(r.estimated_price)}
                        </div>
                        {op.deep_link && (
                          <a href={op.deep_link.replace('{{dest_lat}}', destCoords?.lat).replace('{{dest_lng}}', destCoords?.lng)}
                            style={{ fontSize: 11, color: 'var(--color-accent)', marginTop: 2, display: 'block' }}>
                            Abrir app →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}