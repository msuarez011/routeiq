import { createContext, useContext, useState, useEffect } from 'react';

const CityContext = createContext(null);

const API = import.meta.env.VITE_API_URL;

export function CityProvider({ children }) {
  const [cities, setCities]         = useState([]);
  const [activeCity, setActiveCity] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/cities`)
      .then(r => r.json())
      .then(data => {
        setCities(data);
        setActiveCity(data.find(c => c.name === 'Cali') ?? data[0] ?? null);
      })
      .catch(err => console.error('Error cargando ciudades:', err));
  }, []);

  return (
    <CityContext.Provider value={{ cities, activeCity, setActiveCity }}>
      {children}
    </CityContext.Provider>
  );
}

export const useCity = () => useContext(CityContext);