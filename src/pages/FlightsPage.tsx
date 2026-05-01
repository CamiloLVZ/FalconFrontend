import { useEffect, useState } from "react";
import { searchFlights } from "../services/flightService";
import type { Flight } from "../types/flight";
import { FlightCard } from "../components/FlightCard";

export const FlightsPage = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    date: "",
    status: "",
  });

  const handleSearch = async () => {
    try {
      console.log("Buscando vuelos con filtros:", filters);

      setLoading(true);
      setError(null);

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== ""),
      );

      const data = await searchFlights(cleanFilters);

      console.log("Vuelos encontrados:", data);

      setFlights(data.data);
    } catch (err) {
      setError("Error buscando vuelos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <input
          placeholder="Origen"
          className="border p-2 rounded"
          value={filters.origin}
          onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
        />

        <input
          placeholder="Destino"
          className="border p-2 rounded"
          value={filters.destination}
          onChange={(e) =>
            setFilters({ ...filters, destination: e.target.value })
          }
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        <button
          className="bg-blue-500 text-white rounded"
          onClick={() => handleSearch()}
        >
          Buscar
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Resultados de vuelos</h1>

      {loading && <p>Cargando...</p>}
      {error && <p>{error}</p>}
      {!loading && flights.length === 0 && <p>No hay resultados</p>}

      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
};
