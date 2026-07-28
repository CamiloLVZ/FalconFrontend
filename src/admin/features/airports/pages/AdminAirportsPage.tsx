import { useEffect, useState, useReducer } from "react";
import type { Reducer } from "react";
import { AirportTable } from "../components/AirportTable";
import { AdminDrawer } from "../../../components/AdminDrawer";
import type { Airport } from "../types/airportTypes";
import { getAllAirports } from "../services/airportService";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { Pagination } from "../../../components/Pagination";
import { CountryCreateForm } from "../components/CountryCreateForm";
import { AirportCreateForm } from "../components/AirportCreateForm";

interface State {
  airports: Airport[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isCreateOpen: boolean;
  isCreateCountryOpen: boolean;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: { airports: Airport[]; page: number; totalPages: number; totalElements: number } }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" }
  | { type: "OPEN_CREATE_COUNTRY" }
  | { type: "CLOSE_CREATE_COUNTRY" };

const initialState: State = {
  airports: [],
  loading: false,
  error: null,
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
  isCreateOpen: false,
  isCreateCountryOpen: false,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return {
        ...state,
        loading: false,
        airports: action.payload.airports,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        totalElements: action.payload.totalElements,
      };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.payload, currentPage: 0 };
    case "OPEN_CREATE":
      return { ...state, isCreateOpen: true };
    case "CLOSE_CREATE":
      return { ...state, isCreateOpen: false };
    case "OPEN_CREATE_COUNTRY":
      return { ...state, isCreateCountryOpen: true };
    case "CLOSE_CREATE_COUNTRY":
      return { ...state, isCreateCountryOpen: false };
    default:
      return state;
  }
};

export const AdminAirportsPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { airports, loading, error, currentPage, pageSize, totalPages, totalElements, isCreateOpen, isCreateCountryOpen } = state;

  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const loadAirports = async (
    page: number,
    size: number,
    country?: string,
    search?: string,
  ) => {
    try {
      dispatch({ type: "LOAD_START" });
      const data = await getAllAirports(size, page, country, search);
      dispatch({ type: "LOAD_SUCCESS", payload: { airports: data.content, page: data.page, totalPages: data.totalPages, totalElements: data.totalElements } });
    } catch (err) {
      console.error(err);
      dispatch({ type: "LOAD_ERROR", payload: "No se han podido cargar los aeropuertos. Por favor, inténtalo de nuevo más tarde." });
    }
  };

  useEffect(() => {
    loadAirports(currentPage, pageSize, countryFilter || undefined, searchFilter || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadAirports(0, pageSize, countryFilter || undefined, searchFilter || undefined);
  };

  const handleClearFilters = () => {
    setCountryFilter("");
    setSearchFilter("");
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadAirports(0, pageSize);
  };
  if (error) {
    return (
      <ErrorScreen messageTitle="Error al cargar aeropuertos" message={error} />
    );
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Airports</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "OPEN_CREATE_COUNTRY" })}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
          >
            + Crear País
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "OPEN_CREATE" })}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium"
          >
            + Crear Aeropuerto
          </button>
          <button
            type="button"
            onClick={() => loadAirports(currentPage, pageSize, countryFilter || undefined, searchFilter || undefined)}
            disabled={loading}
            title="Refrescar"
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-gray-700">Buscar</label>
          <input
            type="text"
            aria-label="Buscar"
            placeholder="Nombre o código IATA"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-sm font-medium text-gray-700">País (ISO)</label>
          <input
            type="text"
            aria-label="País (ISO)"
            maxLength={2}
            placeholder="Ej: CO"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : (
          <AirportTable
            airports={airports}
            onEdit={(a) => {
              setSelectedAirport(a);
              setIsDrawerOpen(true);
            }}
          />
        )}
      </div>

      <AdminDrawer
        title={
          selectedAirport
            ? `Aeropuerto ${selectedAirport.iataCode}`
            : "Aeropuerto"
        }
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedAirport && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                Detalles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">IATA</p>
                  <p className="text-gray-900">{selectedAirport.iataCode}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Nombre</p>
                  <p className="text-gray-900">{selectedAirport.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Ciudad</p>
                  <p className="text-gray-900">{selectedAirport.city}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">País</p>
                  <p className="text-gray-900">
                    {selectedAirport.country.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Timezone</p>
                  <p className="text-gray-900">{selectedAirport.timezone}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>

      <AdminDrawer
        title="Crear País"
        isOpen={isCreateCountryOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE_COUNTRY" })}
      >
        <CountryCreateForm
          onClose={() => dispatch({ type: "CLOSE_CREATE_COUNTRY" })}
          onCreated={() => loadAirports(0, pageSize)}
        />
      </AdminDrawer>

      <AdminDrawer
        title="Crear Aeropuerto"
        isOpen={isCreateOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE" })}
      >
        <AirportCreateForm
          onClose={() => dispatch({ type: "CLOSE_CREATE" })}
          onCreated={() => { loadAirports(0, pageSize); dispatch({ type: "SET_PAGE", payload: 0 }); }}
        />
      </AdminDrawer>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={(page) => dispatch({ type: "SET_PAGE", payload: page })}
        onPageSizeChange={(size) => dispatch({ type: "SET_PAGE_SIZE", payload: size })}
      />
    </section>
  );
};
