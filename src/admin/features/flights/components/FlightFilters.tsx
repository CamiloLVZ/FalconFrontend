const FLIGHT_STATUSES = [
  "SCHEDULED",
  "CHECK_IN_AVAILABLE",
  "BOARDING",
  "GATE_CLOSED",
  "COMPLETED",
  "CANCELED",
];

interface FlightFiltersProps {
  flightIdInput: string;
  onFlightIdChange: (v: string) => void;
  flightNumberInput: string;
  onFlightNumberChange: (v: string) => void;
  statusInput: string;
  onStatusChange: (v: string) => void;
  dateFromInput: string;
  onDateFromChange: (v: string) => void;
  dateToInput: string;
  onDateToChange: (v: string) => void;
  loading: boolean;
  onSearch: () => void;
  onClear: () => void;
}

export const FlightFilters = ({
  flightIdInput,
  onFlightIdChange,
  flightNumberInput,
  onFlightNumberChange,
  statusInput,
  onStatusChange,
  dateFromInput,
  onDateFromChange,
  dateToInput,
  onDateToChange,
  loading,
  onSearch,
  onClear,
}: FlightFiltersProps) => {
  return (
    <div className="bg-white border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-sm font-medium text-gray-700">
          ID de Vuelo
        </label>
        <input
          type="text"
          aria-label="ID de Vuelo"
          placeholder="Ej: 123"
          value={flightIdInput}
          onChange={(e) => onFlightIdChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-sm font-medium text-gray-700">
          Número de Vuelo (Ruta)
        </label>
        <input
          type="text"
          aria-label="Número de Vuelo (Ruta)"
          placeholder="Ej: AV1234"
          value={flightNumberInput}
          onChange={(e) => onFlightNumberChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-sm font-medium text-gray-700">Estado</label>
        <select
          value={statusInput}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Estado"
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="">Todos los estados</option>
          {FLIGHT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-sm font-medium text-gray-700">
          Fecha Desde
        </label>
        <input
          type="date"
          aria-label="Fecha Desde"
          value={dateFromInput}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-sm font-medium text-gray-700">
          Fecha Hasta
        </label>
        <input
          type="date"
          aria-label="Fecha Hasta"
          value={dateToInput}
          onChange={(e) => onDateToChange(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium disabled:opacity-50"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};
