import { AirplaneDepartureIcon } from "../icons/AirplaneDepartureIcon.tsx";
import { AirplaneArrivalIcon } from "../icons/AirplaneArrivalIcon.tsx";
import type { FlightSearchParams } from "../../types/flight.ts";
import type { AirportSearchOption } from "../../types/airport.ts";
import { AirportSelect } from "./AirportSelect.tsx";
import { useState } from "react";

interface Props {
  filters: FlightSearchParams;
  origins: AirportSearchOption[];
  destinations: AirportSearchOption[];
  onChange: (filters: FlightSearchParams) => void;
  loadDestinations: (originCode: string) => Promise<void>;
  onSearch: () => void;
}

export const SearchBar = ({
  filters,
  origins,
  destinations,
  onChange,
  loadDestinations,
  onSearch,
}: Props) => {
  const isSearchDisabled =
    !filters.origin.trim() || !filters.destination.trim() || !filters.date;
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  return (
    <div className="bg-gray-50 rounded-2xl shadow-lg p-5 flex flex-col md:flex-row gap-4 items-stretch">
      <div className="rounded-xl border border-gray-300 flex pl-1 pr-4 w-full">
        <div className="flex-1">
          <AirportSelect
            options={origins}
            value={originInput}
            placeholder="Origen"
            icon={<AirplaneDepartureIcon />}
            onSelect={async (airport) => {
              setOriginInput(`${airport.city} (${airport.iataCode})`);
              setDestinationInput("");
              onChange({
                ...filters,
                origin: airport.iataCode,
                destination: "",
              });

              await loadDestinations(airport.iataCode);
            }}
          />
        </div>

        <div className="flex-1 border-l-[0.001rem] border-gray-300">
          <AirportSelect
            options={destinations}
            value={destinationInput}
            placeholder="Destino"
            icon={<AirplaneArrivalIcon />}
            disabled={!filters.origin}
            onSelect={(airport) => {
              setDestinationInput(`${airport.city} (${airport.iataCode})`);
              onChange({
                ...filters,
                destination: airport.iataCode,
              });
            }}
          />
        </div>
      </div>

      <div className="flex-2 w-full">
        <input
          type="date"
          onClick={(e) => e.currentTarget.showPicker()}
          className="rounded-xl border border-gray-300 w-full px-4 py-3 cursor-pointer"
          value={filters.date}
          onChange={(e) =>
            onChange({
              ...filters,
              date: e.target.value,
            })
          }
        />
      </div>

      <button
        onClick={onSearch}
        disabled={isSearchDisabled}
        className={`px-6 py-2 rounded-3xl font-semibold transition h-fit w-fit md:w-auto flex-1 text-[20px] ${
          isSearchDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            : "bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer"
        }`}
      >
        Buscar
      </button>
    </div>
  );
};
