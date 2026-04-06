import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCity } from "../context/CityContext";
import { useGeolocation } from "../hooks/useGeolocation";

export default function Home() {
  const { activeCity, cities, setActiveCity } = useCity();
  const { position } = useGeolocation();
  const navigate = useNavigate();

  const [destLat, setDestLat] = useState("");
  const [destLng, setDestLng] = useState("");
  const [destLabel, setDestLabel] = useState("");
  const [currency, setCurrency] = useState("COP");

  function handleSearch(e) {
    e.preventDefault();
    if (!position) return alert("Activa la geolocalización");
    if (!destLat || !destLng) return alert("Ingresa el destino");
    if (!activeCity) return alert("Selecciona una ciudad");

    const params = new URLSearchParams({
      origin_lat: position.lat,
      origin_lng: position.lng,
      dest_lat: destLat,
      dest_lng: destLng,
      dest_label: destLabel,
      city_id: activeCity.id,
      currency,
    });
    navigate(`/results?${params.toString()}`);
  }

  return (
    <div style={{ padding: "2rem 1rem", maxWidth: 600, margin: "0 auto" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          marginBottom: 8,
        }}
      >
        Route<span style={{ color: "var(--color-accent)" }}>IQ</span>
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Compara todas las opciones de transporte en tu ciudad
      </p>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div
          style={{
            background: "var(--color-surface)",
            border: "0.5px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-accent)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 14,
                color: position
                  ? "var(--color-text-primary)"
                  : "var(--color-text-muted)",
              }}
            >
              {position
                ? `Mi ubicación (${position.lat.toFixed(
                    4
                  )}, ${position.lng.toFixed(4)})`
                : "Obteniendo ubicación..."}
            </span>
          </div>
          <div
            style={{
              height: "0.5px",
              background: "var(--color-border)",
              marginBottom: 12,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-dest)",
                flexShrink: 0,
              }}
            />
            <input
              placeholder="Destino (nombre del lugar)"
              value={destLabel}
              onChange={(e) => setDestLabel(e.target.value)}
              style={{ border: "none", background: "transparent", padding: 0 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Latitud destino"
            value={destLat}
            onChange={(e) => setDestLat(e.target.value)}
            type="number"
            step="any"
          />
          <input
            placeholder="Longitud destino"
            value={destLng}
            onChange={(e) => setDestLng(e.target.value)}
            type="number"
            step="any"
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={activeCity?.id || ""}
            onChange={(e) =>
              setActiveCity(cities.find((c) => c.id === e.target.value))
            }
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="COP">COP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: "14px",
            background: "var(--color-accent)",
            color: "#0A1A14",
            fontWeight: 700,
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: 16,
          }}
        >
          Comparar opciones
        </button>
      </form>
    </div>
  );
}
