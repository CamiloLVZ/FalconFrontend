import { AirplaneDepartureIcon } from "../icons/AirplaneDepartureIcon.tsx";
import { AirplaneArrivalIcon } from "../icons/AirplaneArrivalIcon.tsx";
import type { FlightSearchParams } from "../../types/flight.ts";

interface Props {
  filters: FlightSearchParams;
  onChange: (filters: FlightSearchParams) => void;
  onSearch: () => void;
}

export const SearchBar = ({ filters, onChange, onSearch }: Props) => {
  const isSearchDisabled =
    !filters.origin.trim() || !filters.destination.trim() || !filters.date;

  return (
    <div className="bg-gray-50 rounded-2xl shadow-lg p-5 flex flex-col md:flex-row gap-4 items-stretch">
      <div className="rounded-xl border border-gray-300 flex pl-1 pr-4">
        <div className="flex items-center justify-between px-4 my-3">
          <AirplaneDepartureIcon />
          <input
            type="text"
            placeholder="Origen"
            className="focus:outline-none border-0 rounded-lg px-3 w-full"
            value={filters.origin}
            onChange={(e) => onChange({ ...filters, origin: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between my-2 px-4 border-l-[0.001rem] border-gray-300">
          <AirplaneArrivalIcon />
          <input
            type="text"
            placeholder="Destino"
            className="focus:outline-none border-0 rounded-lg px-3 w-full"
            value={filters.destination}
            onChange={(e) =>
              onChange({ ...filters, destination: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex-2 w-full">
        <input
          type="date"
          onClick={(e) => e.target.showPicker()}
          className="rounded-xl border border-gray-300 w-full px-4 py-3 cursor-pointer"
          value={filters.date}
          onChange={(e) => onChange({ ...filters, date: e.target.value })}
        />
      </div>
      <button
        onClick={() => onSearch()}
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
