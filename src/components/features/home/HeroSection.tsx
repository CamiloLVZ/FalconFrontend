import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import bgImage from "../../../assets/backgrounds/sky-background.png";

import { SearchBar } from "../search/SearchBar.tsx";

import type { FlightSearchParams } from "../../../types/flight.ts";
import type { AirportSearchOption } from "../../../types/airportSearch.ts";

import {
  getAvailableDestinations,
  getAvailableOrigins,
} from "../../../services/airportService.ts";

export const HeroSection = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FlightSearchParams>({
    origin: "",
    destination: "",
    date: "",
    status: "",
  });

  const [origins, setOrigins] = useState<AirportSearchOption[]>([]);

  const [destinations, setDestinations] = useState<AirportSearchOption[]>([]);

  const [originInput, setOriginInput] = useState("");

  const [destinationInput, setDestinationInput] = useState("");

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

  useEffect(() => {
    loadOrigins();
  }, []);

  return (
    <section className="relative z-10 w-full h-[450px] md:h-[550px] lg:h-[650px] overflow-visible">
      {/* Background image */}
      <img
        src={bgImage}
        alt="Sky background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Fade inferior suave */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b from-transparent via-white/50 to-white/99"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 gap-8">
        <div>
          <h1 className="text-8xl font-bold text-white">
            Vuela sin <span className="text-yellow-400">limites</span>
          </h1>

          <p className="mt-4 text-gray-200 mx-auto text-lg">
            Más que un vuelo, un viaje. Eleva tus expectativas con nuestra
            experiencia de vuelo sin igual.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-4xl mt-6">
          <SearchBar
            filters={filters}
            origins={origins}
            destinations={destinations}
            originInput={originInput}
            destinationInput={destinationInput}
            setOriginInput={setOriginInput}
            setDestinationInput={setDestinationInput}
            onChange={setFilters}
            loadDestinations={loadDestinations}
            onSearch={() => {
              const cleanFilters: Record<string, string> = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value !== ""),
              );

              const params = new URLSearchParams(cleanFilters).toString();

              navigate(`/flights?${params}`);
            }}
          />
        </div>
      </div>
    </section>
  );
};
