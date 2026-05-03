import { useEffect, useState } from "react";
import { searchFlights } from "../services/flightService";
import type { CleanFilters, Flight, FlightSearchParams } from "../types/flight";
import { FlightCard } from "../components/FlightCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchBar } from "../components/search/SearchBar";
import { LoadingScreen } from "../components/LoadingScreen";
import { ErrorScreen } from "../components/ErrorScreen";

export const FlightsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [filters, setFilters] = useState<FlightSearchParams>({
    origin: "",
    destination: "",
    date: "",
    status: "",
  });

  const handleSearch = async (customFilters: FlightSearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const cleanFilters: CleanFilters = Object.fromEntries(
        Object.entries(customFilters).filter(([_, value]) => value !== ""),
      );
      const data = await searchFlights(cleanFilters);
      setFlights(data.data);
      setHasSearched(true);
    } catch (err) {
      setError("Error buscando vuelos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const date = searchParams.get("date") || "";

    const initialFilters = {
      origin,
      destination,
      date,
    };

    setFilters(initialFilters);

    if (origin && destination && date) {
      handleSearch(initialFilters);
    } else {
      setLoading(false);
      setHasSearched(false);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center bg-blue-50 px-30 pb-20 pt-15">
      <div className="w-full max-w-4xl sticky top-16 z-20 mb-10">
        <SearchBar
          filters={filters}
          onChange={setFilters}
          onSearch={() => {
            const cleanFilters: Record<string, string> = Object.fromEntries(
              Object.entries(filters).filter(([_, v]) => v !== ""),
            );

            const params = new URLSearchParams(cleanFilters).toString();

            navigate(`/flights?${params}`);
          }}
        />
      </div>
      <div className="mb-6 flex items-center p-5 gap-2 self-start">
        <h1 className="text-[25px] font-bold ">
          Vuelos disponibles {filters.origin} → {filters.destination}
        </h1>
        <p className="text-xl text-gray-400">|</p>
        <p className="text-lg text-gray-500 opacity-75">{filters.date}</p>
      </div>
      {loading && <LoadingScreen />}
      {error && <ErrorScreen message={error} />}
      {!loading && !error && !hasSearched && (
        <div className="w-full text-center py-10">
          <p className="text-gray-500 text-lg">
            Realiza una búsqueda para ver los vuelos disponibles
          </p>
        </div>
      )}
      {!loading && !error && hasSearched && flights.length === 0 && (
        <ErrorScreen message="No se encontraron vuelos con los criterios seleccionados" />
      )}

      <div className=" w-full flex flex-col gap-5">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  );
};
