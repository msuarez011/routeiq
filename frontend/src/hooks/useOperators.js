import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL;

export function useOperators(cityId) {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!cityId) return;
    setLoading(true);
    fetch(`${API}/api/operators?city_id=${cityId}`)
      .then(r => r.json())
      .then(data => {
        setOperators(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cityId]);

  return { operators, loading };
}