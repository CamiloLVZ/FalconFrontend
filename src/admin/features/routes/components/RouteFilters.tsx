interface RouteFiltersProps {
  originFilter: string;
  onOriginChange: (v: string) => void;
  destFilter: string;
  onDestChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  flightNumberFilter: string;
  onFlightNumberChange: (v: string) => void;
  loading: boolean;
  onSearch: () => void;
  onClear: () => void;
}

export const RouteFilters = ({
  originFilter,
  onOriginChange,
  destFilter,
  onDestChange,
  statusFilter,
  onStatusChange,
  flightNumberFilter,
  onFlightNumberChange,
  loading,
  onSearch,
  onClear,
}: RouteFiltersProps) => {
  return (
    <div className="bg-white border rounded-lg p-4 mt-4 flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
        <label htmlFor="routefilters-origin" className="text-sm font-medium text-gray-700">Origen (IATA)</label>
        <input
          type="text"
          id="routefilters-origin"
          aria-label="Origen (IATA)"
          maxLength={3}
          placeholder="Ej: BOG"
          value={originFilter}
          onChange={(e) => onOriginChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
        <label htmlFor="routefilters-dest" className="text-sm font-medium text-gray-700">Destino (IATA)</label>
        <input
          type="text"
          id="routefilters-dest"
          aria-label="Destino (IATA)"
          maxLength={3}
          placeholder="Ej: MIA"
          value={destFilter}
          onChange={(e) => onDestChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase"
        />
      </div>
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label htmlFor="routefilters-status" className="text-sm font-medium text-gray-700">Estado</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Estado"
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="">Todos</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="DRAFT">DRAFT</option>
        </select>
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
        <label htmlFor="routefilters-flightNumber" className="text-sm font-medium text-gray-700">Número de Vuelo</label>
        <input
          type="text"
          id="routefilters-flightNumber"
          aria-label="Número de Vuelo"
          placeholder="Ej: AV"
          value={flightNumberFilter}
          onChange={(e) => onFlightNumberChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
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
