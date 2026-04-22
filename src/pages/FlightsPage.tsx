import { useEffect, useState } from "react";
import { searchFlights } from "../services/flightService";
import type { Flight } from "../types/flight";

export const FlightsPage = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState({
    origin: "BOG",
    destination: "ADZ",
    date: "2026-04-07",
    status: "COMPLETED",
  });

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await searchFlights(filters);
        setFlights(data.data);
      } catch (err) {
        setError("Error cargando vuelos");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Flights</h1>
      {flights.map((flight) => (
        <div key={flight.id}>
          <p>{flight.flightNumber}</p>
          <p>
            {flight.origin} → {flight.destination}
          </p>
        </div>
      ))}
    </div>
  );
};
