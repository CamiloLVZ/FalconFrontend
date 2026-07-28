import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { Pagination } from "../../../components/Pagination";
import { AdminDrawer } from "../../../components/AdminDrawer";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { FlightTable } from "../components/FlightTable";
import {
  getAllFlights,
  getFlightById,
  createFlight,
  rescheduleFlight,
  changeAirplaneType,
  cancelFlight,
} from "../services/flightAdminService";
import type { ResponseFlightDto, CreateFlightDto } from "../types/flightTypes";

const FLIGHT_STATUSES = [
  "SCHEDULED",
  "CHECK_IN_AVAILABLE",
  "BOARDING",
  "GATE_CLOSED",
  "COMPLETED",
  "CANCELED",
];

export const AdminFlightsPage = () => {
  const [flights, setFlights] = useState<ResponseFlightDto[]>([]);
  const [selectedFlight, setSelectedFlight] =
    useState<ResponseFlightDto | null>(null);

  const [flightNumberInput, setFlightNumberInput] = useState("");
  const [flightIdInput, setFlightIdInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [newFlightRouteNumber, setNewFlightRouteNumber] = useState("");
  const [newFlightDeparture, setNewFlightDeparture] = useState("");
  const [newDepartureDate, setNewDepartureDate] = useState("");
  const [newAirplaneTypeId, setNewAirplaneTypeId] = useState("");

  const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return unknownError.response?.data.message ?? fallback;
    }
    return "Ha ocurrido un error inesperado.";
  };

  const loadFlights = useCallback(
    async (
      page: number,
      size: number,
      flightNumber: string,
      status: string,
      flightId: string,
      dateFrom?: string,
      dateTo?: string,
    ) => {
      try {
        setLoading(true);
        setError(null);

        if (flightId.trim()) {
          const id = Number(flightId.trim());
          if (Number.isNaN(id) || id <= 0) {
            setFlights([]);
            setCurrentPage(0);
            setTotalPages(0);
            setTotalElements(0);
            setError("Ingresa un ID de vuelo válido.");
            return;
          }

          const flight = await getFlightById(id);
          setFlights([flight]);
          setCurrentPage(0);
          setTotalPages(1);
          setTotalElements(1);
          return;
        }

        const data = await getAllFlights(
          flightNumber.trim() || null,
          status || null,
          page,
          size,
          dateFrom || undefined,
          dateTo || undefined,
        );
        setFlights(data.content);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (err) {
        console.error(err);
        setFlights([]);
        setCurrentPage(0);
        setTotalPages(0);
        setTotalElements(0);
        setError("No se han podido cargar los vuelos.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadFlights(
      currentPage,
      pageSize,
      flightNumberInput,
      statusInput,
      flightIdInput,
      dateFromInput,
      dateToInput,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(0);
    loadFlights(0, pageSize, flightNumberInput, statusInput, flightIdInput, dateFromInput, dateToInput);
  };

  const handleClearFilters = () => {
    setFlightIdInput("");
    setFlightNumberInput("");
    setStatusInput("");
    setDateFromInput("");
    setDateToInput("");
    setCurrentPage(0);
    loadFlights(0, pageSize, "", "", "");
  };

  const handleEditClick = (flight: ResponseFlightDto) => {
    setSelectedFlight(flight);
    setNewDepartureDate(flight.departureDateTime.substring(0, 16));
    setNewAirplaneTypeId("");
    setActionError(null);
    setIsDrawerOpen(true);
  };

  const handleReschedule = async () => {
    if (!selectedFlight || !newDepartureDate) return;
    try {
      setIsSubmitting(true);
      setActionError(null);

      const localDateTime = new Date(newDepartureDate).toISOString().slice(0, 19);
      await rescheduleFlight(selectedFlight.id, localDateTime);

      setActionError(null);
      loadFlights(
        currentPage,
        pageSize,
        flightNumberInput,
        statusInput,
        flightIdInput,
      );
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "No se pudo reprogramar el vuelo."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeAirplane = async () => {
    if (!selectedFlight || !newAirplaneTypeId) return;
    try {
      setIsSubmitting(true);
      setActionError(null);

      await changeAirplaneType(
        selectedFlight.id,
        parseInt(newAirplaneTypeId, 10),
      );

      setActionError(null);
      loadFlights(
        currentPage,
        pageSize,
        flightNumberInput,
        statusInput,
        flightIdInput,
      );
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo cambiar el avión."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelFlight = async () => {
    if (!selectedFlight) return;

    if (
      !window.confirm(
        `¿Estás seguro de que deseas cancelar el vuelo ${selectedFlight.flightNumber}?`,
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError(null);
      await cancelFlight(selectedFlight.id);
      setActionError(null);
      loadFlights(
        currentPage,
        pageSize,
        flightNumberInput,
        statusInput,
        flightIdInput,
      );
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo cancelar el vuelo."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Vuelos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCreateError(null);
              setNewFlightRouteNumber("");
              setNewFlightDeparture("");
              setIsCreateDrawerOpen(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium"
          >
            + Crear Vuelo
          </button>
          <button
            onClick={() => loadFlights(currentPage, pageSize, flightNumberInput, statusInput, flightIdInput, dateFromInput, dateToInput)}
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

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-gray-700">
            ID de Vuelo
          </label>
          <input
            type="text"
            placeholder="Ej: 123"
            value={flightIdInput}
            onChange={(e) => setFlightIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-gray-700">
            Número de Vuelo (Ruta)
          </label>
          <input
            type="text"
            placeholder="Ej: AV1234"
            value={flightNumberInput}
            onChange={(e) => setFlightNumberInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-gray-700">Estado</label>
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
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
            value={dateFromInput}
            onChange={(e) => setDateFromInput(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-sm font-medium text-gray-700">
            Fecha Hasta
          </label>
          <input
            type="date"
            value={dateToInput}
            onChange={(e) => setDateToInput(e.target.value)}
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

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : (
          <FlightTable flights={flights} onEdit={handleEditClick} />
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
        title="Crear Vuelo"
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newFlightRouteNumber.trim() || !newFlightDeparture) return;
            try {
              setCreateSubmitting(true);
              setCreateError(null);
              const localDateTime = new Date(newFlightDeparture).toISOString().slice(0, 19);
              const dto: CreateFlightDto = {
                routeFlightNumber: newFlightRouteNumber.trim().toUpperCase(),
                departureDateTime: localDateTime,
              };
              await createFlight(dto);
              setIsCreateDrawerOpen(false);
              loadFlights(currentPage, pageSize, flightNumberInput, statusInput, flightIdInput, dateFromInput, dateToInput);
            } catch (err) {
              setCreateError(getApiErrorMessage(err, "No se pudo crear el vuelo."));
            } finally {
              setCreateSubmitting(false);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Ruta <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Ej: AV1234"
              value={newFlightRouteNumber}
              onChange={(e) => setNewFlightRouteNumber(e.target.value.toUpperCase())}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha y hora de salida <span className="text-red-500">*</span></label>
            <input
              type="datetime-local"
              value={newFlightDeparture}
              onChange={(e) => setNewFlightDeparture(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsCreateDrawerOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
            <button type="submit" disabled={createSubmitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{createSubmitting ? "Creando..." : "Crear"}</button>
          </div>
          {createError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{createError}</div>}
        </form>
      </AdminDrawer>

      <AdminDrawer
        title={
          selectedFlight
            ? `Editar Vuelo ${selectedFlight.flightNumber}`
            : "Editar Vuelo"
        }
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedFlight && (
          <div className="space-y-8">
            {actionError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {actionError}
              </div>
            )}

            {/* Seccion 1: Reprogramar */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-3">
                Reprogramar Salida
              </h3>
              <div className="space-y-3">
                <input
                  type="datetime-local"
                  value={newDepartureDate}
                  onChange={(e) => setNewDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                />
                <button
                  onClick={handleReschedule}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
                >
                  Confirmar Nueva Fecha
                </button>
              </div>
            </div>

            {/* Seccion 2: Cambiar Avión */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-3">
                Cambiar Aeronave
              </h3>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="ID del Tipo de Aeronave"
                  value={newAirplaneTypeId}
                  onChange={(e) => setNewAirplaneTypeId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                />
                <button
                  onClick={handleChangeAirplane}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
                >
                  Asignar Aeronave
                </button>
              </div>
            </div>

            {/* Seccion 3: Danger Zone */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">
                Zona de Peligro
              </h3>
              <p className="text-xs text-red-600 mb-3">
                La cancelación de un vuelo es irreversible y afectará a los
                pasajeros.
              </p>
              <button
                onClick={handleCancelFlight}
                disabled={
                  isSubmitting ||
                  selectedFlight.status === "CANCELLED" ||
                  selectedFlight.status === "CANCELED"
                }
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50"
              >
                Cancelar Vuelo
              </button>
            </div>
          </div>
        )}
      </AdminDrawer>
    </section>
  );
};
