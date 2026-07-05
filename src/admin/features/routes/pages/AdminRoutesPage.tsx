import { useEffect, useState } from "react";
import axios from "axios";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { AdminDrawer } from "../../../components/AdminDrawer";
import { Pagination } from "../../../components/Pagination";
import { RouteTable } from "../components/RouteTable";
import { DaySelection } from "../components/DaySelection";
import { getAllAirports } from "../../airports/services/airportService";
import { getAircrafts } from "../../aircraft/services/aircraftService";
import type { Airport } from "../../airports/types/airportTypes";
import type { AircraftType } from "../../aircraft/types/aircraftTypes";
import { ACTION_LABELS } from "../constants/routes.constants";
import {
  getAllRoutes,
  updateRoute,
  setRouteOperatingSchedules,
  getRouteOperatingSchedules,
} from "../services/routeService";
import { STATUS_ACTION_SERVICES } from "../services/routeStatusActions";
import type {
  DayOfWeek,
  ResponseRoute,
  RouteStatusAction,
  LocalTime,
} from "../types/routeTypes";
import { replaceRouteInList } from "../utils/routes.utils";

export const AdminRoutesPage = () => {
  const [routes, setRoutes] = useState<ResponseRoute[]>([]);
  const sortedRoutes = [...routes].sort((a, b) =>
    a.flightNumber.localeCompare(b.flightNumber),
  );
  const [selectedRoute, setSelectedRoute] = useState<ResponseRoute | null>(
    null,
  );

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingStatusAction, setPendingStatusAction] = useState<{
    route: ResponseRoute;
    action: RouteStatusAction;
  } | null>(null);
  const isConfirmationOpen = pendingStatusAction !== null;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [airportsData, setAirportsData] = useState<Airport[]>([]);
  const [aircraftsData, setAircraftsData] = useState<AircraftType[]>([]);
  const [editLoadingData, setEditLoadingData] = useState(false);
  // scheduleLoading removed — not required in current flow

  const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return unknownError.response?.data.message ?? fallback;
    }

    return "Ha ocurrido un error inesperado.";
  };

  const loadRoutes = async (page: number, size: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRoutes(size, page);
      const routesWithSchedules = await Promise.all(
        data.content.map(async (route) => {
          try {
            const scheduleData = await getRouteOperatingSchedules(
              route.flightNumber,
            );
            return {
              ...route,
              daysOfWeek: scheduleData.daysOfWeek || [],
              schedules: scheduleData.schedules || [],
            };
          } catch {
            return {
              ...route,
              daysOfWeek: [],
              schedules: [],
            };
          }
        }),
      );
      setRoutes(routesWithSchedules);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error(err);
      setError(
        "No se han podido cargar las rutas. Por favor, inténtalo de nuevo más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Volver a la primera página al cambiar tamaño
  };

  // closeEditModal removed — using inline handlers

  const closeConfirmationModal = () => {
    setPendingStatusAction(null);
  };

  const handleStatusAction = (
    flightNumber: string,
    action: RouteStatusAction,
  ) => {
    setError(null);
    setActionError(null);
    const route = routes.find((r) => r.flightNumber === flightNumber);

    if (!route) return;

    setPendingStatusAction({
      route,
      action,
    });
  };

  const executePendingAction = async () => {
    if (!pendingStatusAction) return;

    const { route, action } = pendingStatusAction;
    const updateService = STATUS_ACTION_SERVICES[action];

    try {
      setIsSubmitting(true);
      setActionError(null);

      const updatedRoute = await updateService(route.flightNumber);

      setRoutes((prev) => replaceRouteInList(prev, updatedRoute));
      setPendingStatusAction(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo actualizar la ruta."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // handleEditRoute removed; inline edit loader is used where needed

  // schedule editing is rendered inside the main Edit drawer

  const saveEditedRoute = async (
    flightNumber: string,
    originIata: string,
    destinationIata: string,
    aircraftId: number,
    duration: number,
  ) => {
    try {
      setEditSubmitting(true);
      setEditError(null);

      const updatedRoute = await updateRoute(flightNumber, {
        airportOriginIataCode: originIata,
        airportDestinationIataCode: destinationIata,
        idDefaultAirplaneType: aircraftId,
        lengthMinutes: duration,
      });

      setRoutes((prev) => replaceRouteInList(prev, updatedRoute));
      setIsEditOpen(false);
    } catch (err) {
      setEditError(getApiErrorMessage(err, "No se pudo actualizar la ruta."));
      console.error("Error updating route:", err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const saveEditedSchedule = async (
    flightNumber: string,
    daysOfWeek: DayOfWeek[],
    schedules: LocalTime[],
  ) => {
    try {
      setScheduleSubmitting(true);
      setScheduleError(null);

      const scheduleData = await setRouteOperatingSchedules(flightNumber, {
        daysOfWeek,
        schedules,
      });

      setRoutes((prev) =>
        prev.map((r) =>
          r.flightNumber === flightNumber
            ? {
                ...r,
                daysOfWeek: scheduleData.daysOfWeek,
                schedules: scheduleData.schedules,
              }
            : r,
        ),
      );
    } catch (err) {
      setScheduleError(
        getApiErrorMessage(err, "No se pudo actualizar los horarios."),
      );
      console.error("Error updating schedule:", err);
    } finally {
      setScheduleSubmitting(false);
    }
  };

  if (error) {
    return <ErrorScreen messageTitle="Error al cargar rutas" message={error} />;
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <h1 className="text-2xl font-bold">Rutas</h1>
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : (
          <RouteTable
            routes={sortedRoutes}
            onStatusAction={handleStatusAction}
            onEdit={(r) => {
              // open consolidated edit drawer which includes schedule tab
              setSelectedRoute(r);
              setEditError(null);
              setEditLoadingData(true);
              (async () => {
                try {
                  const [airportsResp, aircraftsResp] = await Promise.all([
                    getAllAirports(1000, 0),
                    getAircrafts(),
                  ]);
                  setAirportsData(airportsResp.content);
                  setAircraftsData(aircraftsResp);
                  setIsEditOpen(true);
                } catch {
                  setEditError("Error al cargar datos para edición");
                } finally {
                  setEditLoadingData(false);
                }
              })();
            }}
          />
        )}

        <AdminDrawer
          title={
            selectedRoute
              ? `Editar ruta ${selectedRoute.flightNumber}`
              : "Editar ruta"
          }
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        >
          {selectedRoute && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const originIata = (
                  form.elements.namedItem("originIata") as HTMLSelectElement
                ).value;
                const destinationIata = (
                  form.elements.namedItem(
                    "destinationIata",
                  ) as HTMLSelectElement
                ).value;
                const aircraftId = parseInt(
                  (form.elements.namedItem("aircraftId") as HTMLSelectElement)
                    .value,
                );
                const duration = parseInt(
                  (form.elements.namedItem("duration") as HTMLInputElement)
                    .value,
                );
                saveEditedRoute(
                  selectedRoute.flightNumber,
                  originIata,
                  destinationIata,
                  aircraftId,
                  duration,
                );
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número de vuelo
                </label>
                <input
                  type="text"
                  value={selectedRoute.flightNumber}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Aeropuerto de origen
                </label>
                <select
                  name="originIata"
                  defaultValue={selectedRoute.airportOrigin.iataCode}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                >
                  <option value="">Seleccionar origen</option>
                  {airportsData.map((airport) => (
                    <option key={airport.iataCode} value={airport.iataCode}>
                      {airport.iataCode} - {airport.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Aeropuerto de destino
                </label>
                <select
                  name="destinationIata"
                  defaultValue={selectedRoute.airportDestination.iataCode}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                >
                  <option value="">Seleccionar destino</option>
                  {airportsData.map((airport) => (
                    <option key={airport.iataCode} value={airport.iataCode}>
                      {airport.iataCode} - {airport.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de aeronave (activas)
                </label>
                <select
                  name="aircraftId"
                  defaultValue={selectedRoute.defaultAirplaneType.id}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                >
                  <option value="">Seleccionar aeronave</option>
                  {aircraftsData
                    .filter((a) => a.status === "ACTIVE")
                    .map((aircraft) => (
                      <option key={aircraft.id} value={aircraft.id}>
                        {aircraft.producer} {aircraft.model}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duración del vuelo (minutos)
                </label>
                <input
                  name="duration"
                  type="number"
                  min={1}
                  defaultValue={
                    // some route objects use `durationMinutes`, others `lengthMinutes`.
                    // prefer `durationMinutes` which is the canonical type field.
                    selectedRoute.durationMinutes ??
                    selectedRoute.lengthMinutes ??
                    0
                  }
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting || editLoadingData}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {editSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>

              {editError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">
                  {editError}
                </div>
              )}
            </form>
          )}
          {selectedRoute && (
            <div className="pt-6">
              <h2 className="text-lg font-semibold">Horarios</h2>
              <EditScheduleContent
                route={selectedRoute}
                onSave={saveEditedSchedule}
                isSubmitting={scheduleSubmitting}
                error={scheduleError}
              />
            </div>
          )}
        </AdminDrawer>

        {isConfirmationOpen && pendingStatusAction ? (
          <ConfirmationModal
            title="Confirmar acción"
            message={`¿Desea ${ACTION_LABELS[pendingStatusAction.action].toLowerCase()} la ruta ${pendingStatusAction.route.flightNumber}?`}
            onConfirm={executePendingAction}
            onCancel={closeConfirmationModal}
            error={actionError}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </section>
  );
};

// Inline schedule editor used inside AdminDrawer to replace modal
function EditScheduleContent({
  route,
  onSave,
  isSubmitting,
  error,
}: {
  route: ResponseRoute;
  onSave: (
    flightNumber: string,
    daysOfWeek: DayOfWeek[],
    schedules: LocalTime[],
  ) => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [schedules, setSchedules] = useState<LocalTime[]>([]);
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        const scheduleData = await getRouteOperatingSchedules(
          route.flightNumber,
        );
        setSelectedDays(scheduleData.daysOfWeek || []);
        setSchedules(scheduleData.schedules || []);
      } catch {
        setSelectedDays([]);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [route.flightNumber]);

  const handleAddTime = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newTime) return;

    if (schedules.includes(newTime)) {
      setLoadError("Este horario ya ha sido agregado.");
      return;
    }

    setLoadError(null);
    setSchedules((prev) => [...prev, newTime].sort());
    setNewTime("");
  };

  const handleRemoveTime = (timeToRemove: LocalTime) => {
    setSchedules((prev) => prev.filter((t) => t !== timeToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      setLoadError("Debe seleccionar al menos un día de operación");
      return;
    }
    if (schedules.length === 0) {
      setLoadError("Debe agregar al menos una hora de salida");
      return;
    }
    setLoadError(null);
    onSave(route.flightNumber, selectedDays, schedules);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <h3 className="mb-2 font-medium text-gray-900">
          Ruta: <span className="font-bold">{route.flightNumber}</span>
        </h3>
        <p className="text-sm text-gray-600">
          {route.airportOrigin.iataCode} → {route.airportDestination.iataCode}
        </p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Días de operación
        </label>
        {loading ? (
          <div className="text-center text-sm text-gray-500">
            Cargando días...
          </div>
        ) : (
          <DaySelection
            selectedDays={selectedDays}
            onDaysChange={setSelectedDays}
          />
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Horas de salida
        </label>
        {loading ? (
          <div className="text-center text-sm text-gray-500">
            Cargando horarios...
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
              {schedules.length === 0 ? (
                <span className="text-sm text-gray-400 self-center">
                  No hay horas de salida configuradas
                </span>
              ) : (
                schedules.map((time) => (
                  <span
                    key={time}
                    className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-mono font-medium text-blue-700 shadow-sm border border-blue-100"
                  >
                    {time}
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(time)}
                      className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                    >
                      <span className="sr-only">Eliminar horario</span>
                      <svg
                        className="h-2 w-2"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 8 8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.5"
                          d="M1 1l6 6m0-6L1 7"
                        />
                      </svg>
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTime}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium"
          onClick={() => {
            /* parent drawer will handle close */
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {(error || loadError) && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">
          {error || loadError}
        </div>
      )}
    </form>
  );
}
