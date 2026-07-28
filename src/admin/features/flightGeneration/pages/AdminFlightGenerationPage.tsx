import { useEffect, useState } from "react";
import axios from "axios";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { Pagination } from "../../../components/Pagination";
import { AdminDrawer } from "../../../components/AdminDrawer";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { FlightGenerationTable } from "../components/FlightGenerationTable";
import {
  getAllGenerations,
  generateFlightsForRoute,
  generateFlightsForAllRoutes,
} from "../services/flightGenerationService";
import type { FlightGeneration } from "../types/flightGenerationTypes";

export const AdminFlightGenerationPage = () => {
  const [generations, setGenerations] = useState<FlightGeneration[]>([]);
  const [selectedGeneration, setSelectedGeneration] =
    useState<FlightGeneration | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter state
  const [typeFilter, setTypeFilter] = useState("");
  const [genStatusFilter, setGenStatusFilter] = useState("");
  const [genRouteFilter, setGenRouteFilter] = useState("");

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [routeFlightNumber, setRouteFlightNumber] = useState("");

  const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return unknownError.response?.data.message ?? fallback;
    }
    return "Ha ocurrido un error inesperado.";
  };

  const loadGenerations = async (
    page: number,
    size: number,
    filters?: { type?: string; status?: string; routeFlightNumber?: string },
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllGenerations(page, size, filters);
      setGenerations(data.content);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error(err);
      setError("No se han podido cargar las generaciones.");
    } finally {
      setLoading(false);
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
    setCurrentPage(0);
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
    setCurrentPage(0);
    loadGenerations(0, pageSize);
  };

  const handleTriggerGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setActionError(null);
      if (routeFlightNumber.trim()) {
        await generateFlightsForRoute(routeFlightNumber.trim());
      } else {
        await generateFlightsForAllRoutes();
      }
      setRouteFlightNumber("");
      loadGenerations(currentPage, pageSize, {
        type: typeFilter || undefined,
        status: genStatusFilter || undefined,
        routeFlightNumber: genRouteFilter || undefined,
      }); // reload
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "No se pudo iniciar la generación."),
      );
    } finally {
      setIsSubmitting(false);
    }
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
          onClick={() => setIsDrawerOpen(true)}
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
            placeholder="Ej: AV1234"
            value={genRouteFilter}
            onChange={(e) => setGenRouteFilter(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            Buscar
          </button>
          <button
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
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(0);
        }}
      />

      <AdminDrawer
        title="Generar Vuelos"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <form onSubmit={handleTriggerGeneration} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {actionError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ruta (Opcional)
            </label>
            <input
              type="text"
              value={routeFlightNumber}
              onChange={(e) => setRouteFlightNumber(e.target.value)}
              placeholder="Ej. AV123 (Dejar en blanco para todas)"
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              Si se deja en blanco, se generarán vuelos para todas las rutas
              activas.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Iniciando..." : "Iniciar Generación"}
            </button>
          </div>
        </form>
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
