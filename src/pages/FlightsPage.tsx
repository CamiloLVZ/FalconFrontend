import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchFlights } from "../services/flightService";
import {
  getAvailableOrigins,
  getAvailableDestinations,
} from "../services/airportService";
import type { CleanFilters, Flight, FlightSearchParams } from "../types/flight";
import type { AirportSearchOption } from "../types/airport";
import { FlightCard } from "../components/features/flights/FlightCard.tsx";
import { SearchBar } from "../components/features/search/SearchBar";
import { LoadingScreen } from "../components/common/LoadingScreen.tsx";
import { ErrorScreen } from "../components/common/ErrorScreen.tsx";

export const FlightsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [origins, setOrigins] = useState<AirportSearchOption[]>([]);
  const [destinations, setDestinations] = useState<AirportSearchOption[]>([]);

  const [searchFilters, setSearchFilters] = useState<FlightSearchParams>({
    origin: "",
    destination: "",
    date: "",
    status: "",
  });

  const [appliedDisplay, setAppliedDisplay] = useState({
    origin: "",
    destination: "",
    date: "",
  });

  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const formatAirportLabel = (airport: AirportSearchOption) => {
    return `${airport.city} (${airport.iataCode})`;
  };

  const loadOrigins = async () => {
    try {
      const data = await getAvailableOrigins();

      setOrigins(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDestinations = async (originCode: string) => {
    try {
      const data = await getAvailableDestinations(originCode);
      setDestinations(data);

      return data;
    } catch (error) {
      console.error(error);

      return [];
    }
  };

  const handleSearch = async (
    customFilters: FlightSearchParams,
    displayData?: {
      origin: string;
      destination: string;
      date: string;
    },
  ) => {
    try {
      setLoading(true);
      setError(null);

      const cleanFilters: CleanFilters = Object.fromEntries(
        Object.entries(customFilters).filter(([, value]) => value !== ""),
      );

      const data = await searchFlights(cleanFilters);
      setFlights(data.data);

      if (displayData) {
        setAppliedDisplay(displayData);
      }

      setHasSearched(true);
    } catch {
      setError("Error buscando vuelos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrigins();
  }, []);

  useEffect(() => {
    if (origins.length === 0) {
      return;
    }

    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const date = searchParams.get("date") || "";
    const initialFilters: FlightSearchParams = {
      origin,
      destination,
      date,
      status: "",
    };

    setSearchFilters(initialFilters);

    if (!origin || !destination || !date) {
      setLoading(false);

      setHasSearched(false);

      return;
    }

    const originAirport = origins.find(
      (airport) => airport.iataCode === origin,
    );

    if (!originAirport) {
      return;
    }

    const formattedOrigin = formatAirportLabel(originAirport);

    setOriginInput(formattedOrigin);

    loadDestinations(origin).then((loadedDestinations) => {
      const destinationAirport = loadedDestinations.find(
        (airport) => airport.iataCode === destination,
      );

      if (!destinationAirport) {
        return;
      }

      const formattedDestination = formatAirportLabel(destinationAirport);

      setDestinationInput(formattedDestination);

      handleSearch(initialFilters, {
        origin: formattedOrigin,
        destination: formattedDestination,
        date,
      });
    });
  }, [searchParams, origins]);

  return (
    <div className="flex flex-col items-center bg-blue-50 px-30 pb-20 pt-15">
      <div className="w-full max-w-4xl sticky top-16 z-20 mb-10">
        <SearchBar
          filters={searchFilters}
          origins={origins}
          destinations={destinations}
          originInput={originInput}
          destinationInput={destinationInput}
          setOriginInput={setOriginInput}
          setDestinationInput={setDestinationInput}
          onChange={setSearchFilters}
          loadDestinations={loadDestinations}
          onSearch={() => {
            setAppliedDisplay({
              origin: originInput,
              destination: destinationInput,
              date: searchFilters.date,
            });

            const cleanFilters: Record<string, string> = Object.fromEntries(
              Object.entries(searchFilters).filter(([, value]) => value !== ""),
            );

            const params = new URLSearchParams(cleanFilters).toString();

            navigate(`/flights?${params}`);
          }}
        />
      </div>

      <div className="mb-6 flex items-center p-5 gap-2 self-start">
        <h1 className="text-[25px] flex gap-2">
          <span className="font-bold">Vuelos disponibles:</span>

          <span>
            {appliedDisplay.origin} → {appliedDisplay.destination}
          </span>
        </h1>

        <p className="text-xl text-gray-400">|</p>

        <p className="text-lg text-gray-500 opacity-75">
          {appliedDisplay.date}
        </p>
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

      <div className="w-full flex flex-col gap-5">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  );
};
