import { useEffect, useState, useReducer } from "react";
import type { Reducer } from "react";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { Pagination } from "../../../components/Pagination";
import { AdminDrawer } from "../../../components/AdminDrawer";
import { FlightGenerationTable } from "../components/FlightGenerationTable";
import {
  getAllGenerations,
} from "../services/flightGenerationService";
import type { FlightGeneration } from "../types/flightGenerationTypes";
import { FlightGenerateForm } from "../components/FlightGenerateForm";

interface State {
  generations: FlightGeneration[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isDrawerOpen: boolean;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: { generations: FlightGeneration[]; page: number; totalPages: number; totalElements: number } }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" };

const initialState: State = {
  generations: [],
  loading: false,
  error: null,
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
  isDrawerOpen: false,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return {
        ...state,
        loading: false,
        generations: action.payload.generations,
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
    case "OPEN_DRAWER":
      return { ...state, isDrawerOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, isDrawerOpen: false };
    default:
      return state;
  }
};

export const AdminFlightGenerationPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { generations, loading, error, currentPage, pageSize, totalPages, totalElements, isDrawerOpen } = state;

  const [selectedGeneration, setSelectedGeneration] = useState<FlightGeneration | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [genStatusFilter, setGenStatusFilter] = useState("");
  const [genRouteFilter, setGenRouteFilter] = useState("");

  const loadGenerations = async (
    page: number,
    size: number,
    filters?: { type?: string; status?: string; routeFlightNumber?: string },
  ) => {
    try {
      dispatch({ type: "LOAD_START" });
      const data = await getAllGenerations(page, size, filters);
      dispatch({
        type: "LOAD_SUCCESS",
        payload: {
          generations: data.content,
          page: data.page,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
        },
      });
    } catch (err) {
      console.error(err);
      dispatch({ type: "LOAD_ERROR", payload: "No se han podido cargar las generaciones." });
    }
  };

  useEffect(() => {
    loadGenerations(currentPage, pageSize, {
      type: typeFilter || undefined,
      status: genStatusFilter || undefined,
      routeFlightNumber: genRouteFilter || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadGenerations(0, pageSize, {
      type: typeFilter || undefined,
      status: genStatusFilter || undefined,
      routeFlightNumber: genRouteFilter || undefined,
    });
  };

  const handleClearFilters = () => {
    setTypeFilter("");
    setGenStatusFilter("");
    setGenRouteFilter("");
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadGenerations(0, pageSize);
  };

  if (error) {
    return <ErrorScreen messageTitle="Error" message={error} />;
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Generación de Vuelos</h1>
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => loadGenerations(currentPage, pageSize, {
            type: typeFilter || undefined,
            status: genStatusFilter || undefined,
            routeFlightNumber: genRouteFilter || undefined,
          })}
          disabled={loading}
          title="Refrescar"
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "OPEN_DRAWER" })}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Generar Vuelos
        </button>
      </div>
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Tipo"
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">Todos</option>
            <option value="DAILY">DAILY</option>
            <option value="ROUTE">ROUTE</option>
            <option value="GLOBAL">GLOBAL</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-sm font-medium text-gray-700">Estado</label>
          <select
            value={genStatusFilter}
            onChange={(e) => setGenStatusFilter(e.target.value)}
            aria-label="Estado"
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">Todos</option>
            <option value="RUNNING">RUNNING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-gray-700">Ruta</label>
          <input
            type="text"
            aria-label="Ruta"
            placeholder="Ej: AV1234"
            value={genRouteFilter}
            onChange={(e) => setGenRouteFilter(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
          <FlightGenerationTable
            generations={generations}
            onViewDetails={(gen) => {
              setSelectedGeneration(gen);
              setIsDetailsOpen(true);
            }}
          />
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={(page) => dispatch({ type: "SET_PAGE", payload: page })}
        onPageSizeChange={(size) => dispatch({ type: "SET_PAGE_SIZE", payload: size })}
      />

      <AdminDrawer
        title="Generar Vuelos"
        isOpen={isDrawerOpen}
        onClose={() => dispatch({ type: "CLOSE_DRAWER" })}
      >
        <FlightGenerateForm
          onClose={() => dispatch({ type: "CLOSE_DRAWER" })}
          onGenerated={() => loadGenerations(currentPage, pageSize, {
            type: typeFilter || undefined,
            status: genStatusFilter || undefined,
            routeFlightNumber: genRouteFilter || undefined,
          })}
        />
      </AdminDrawer>

      <AdminDrawer
        title={
          selectedGeneration
            ? `Generación ${selectedGeneration.generationId}`
            : "Detalles"
        }
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      >
        {selectedGeneration && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Resumen</h3>
              <p className="text-sm">ID: {selectedGeneration.generationId}</p>
              <p className="text-sm">Tipo: {selectedGeneration.type}</p>
              <p className="text-sm">
                Ruta: {selectedGeneration.routeId ?? "-"}
              </p>
              <p className="text-sm">
                Generados: {selectedGeneration.totalGenerated ?? "-"}
              </p>
              <p className="text-sm">Estado: {selectedGeneration.status}</p>
              <p className="text-sm">
                Inicio:{" "}
                {new Date(selectedGeneration.startedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </AdminDrawer>
    </section>
  );
};
