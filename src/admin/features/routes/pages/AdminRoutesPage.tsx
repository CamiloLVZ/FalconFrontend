import { useEffect, useState } from "react";
import axios from "axios";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { Pagination } from "../../../components/Pagination";
import { RouteTable } from "../components/RouteTable";
import { EditRouteModal } from "../components/modals/EditRouteModal";
import { EditScheduleModal } from "../components/modals/EditScheduleModal";
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
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

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

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeScheduleModal = () => {
    setIsScheduleOpen(false);
  };

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

  const handleEditRoute = (route: ResponseRoute) => {
    setSelectedRoute(route);
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleEditSchedule = (route: ResponseRoute) => {
    setSelectedRoute(route);
    setScheduleError(null);
    setIsScheduleOpen(true);
  };

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
      setIsScheduleOpen(false);
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
            onEditRoute={handleEditRoute}
            onEditSchedule={handleEditSchedule}
          />
        )}

        {isEditOpen && selectedRoute ? (
          <EditRouteModal
            route={selectedRoute}
            onCancel={closeEditModal}
            onSave={saveEditedRoute}
            isSubmitting={editSubmitting}
            error={editError}
          />
        ) : null}

        {isScheduleOpen && selectedRoute ? (
          <EditScheduleModal
            route={selectedRoute}
            onCancel={closeScheduleModal}
            onSave={saveEditedSchedule}
            isSubmitting={scheduleSubmitting}
            error={scheduleError}
          />
        ) : null}

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
