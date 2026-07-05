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
  generateFlights,
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

  const loadGenerations = async (page: number, size: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllGenerations(page, size);
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
    loadGenerations(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleTriggerGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setActionError(null);
      await generateFlights(routeFlightNumber || undefined);
      setIsDrawerOpen(false);
      setRouteFlightNumber("");
      loadGenerations(currentPage, pageSize); // reload
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
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Generar Vuelos
        </button>
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
