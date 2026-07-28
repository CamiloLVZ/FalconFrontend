import type { PassengerSearchMode } from "../types/passengerTypes";

interface PassengerFiltersProps {
  searchMode: PassengerSearchMode;
  flightIdInput: string;
  onFlightIdChange: (v: string) => void;
  passportInput: string;
  onPassportChange: (v: string) => void;
  identificationInput: string;
  onIdentificationChange: (v: string) => void;
  countryCodeInput: string;
  onCountryCodeChange: (v: string) => void;
  onModeChange: (mode: PassengerSearchMode) => void;
  onFlightSearch: () => void;
  onSingleSearch: () => void;
}

export const PassengerFilters = ({
  searchMode,
  flightIdInput,
  onFlightIdChange,
  passportInput,
  onPassportChange,
  identificationInput,
  onIdentificationChange,
  countryCodeInput,
  onCountryCodeChange,
  onModeChange,
  onFlightSearch,
  onSingleSearch,
}: PassengerFiltersProps) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            { mode: "all" as PassengerSearchMode, label: "Todos" },
            { mode: "by-flight" as PassengerSearchMode, label: "Por Vuelo" },
            { mode: "by-passport" as PassengerSearchMode, label: "Por Pasaporte" },
            { mode: "by-identification" as PassengerSearchMode, label: "Por Identificación" },
          ]
        ).map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onModeChange(mode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              searchMode === mode
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {searchMode === "by-flight" && (
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">ID del Vuelo</label>
            <input
              type="number"
              aria-label="ID del Vuelo"
              placeholder="Ej: 12"
              value={flightIdInput}
              onChange={(e) => onFlightIdChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onFlightSearch()}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={onFlightSearch}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
          >
            Buscar
          </button>
        </div>
      )}

      {searchMode === "by-passport" && (
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Pasaporte</label>
            <input
              type="text"
              aria-label="Número de Pasaporte"
              placeholder="Ej: A1234567"
              value={passportInput}
              onChange={(e) => onPassportChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSingleSearch()}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={onSingleSearch}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
          >
            Buscar
          </button>
        </div>
      )}

      {searchMode === "by-identification" && (
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Identificación</label>
            <input
              type="text"
              aria-label="Número de Identificación"
              placeholder="Ej: 1032456789"
              value={identificationInput}
              onChange={(e) => onIdentificationChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSingleSearch()}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-700 mb-1">País (ISO)</label>
            <input
              type="text"
              aria-label="País (ISO)"
              placeholder="Ej: CO"
              maxLength={2}
              value={countryCodeInput}
              onChange={(e) => onCountryCodeChange(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && onSingleSearch()}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary uppercase"
            />
          </div>
          <button
            type="button"
            onClick={onSingleSearch}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
          >
            Buscar
          </button>
        </div>
      )}
    </div>
  );
};
