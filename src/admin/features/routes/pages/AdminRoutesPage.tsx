import { useEffect, useState, useReducer } from "react";
import type { Reducer } from "react";
import axios from "axios";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { AdminDrawer } from "../../../components/AdminDrawer";
import { Pagination } from "../../../components/Pagination";
import { RouteTable } from "../components/RouteTable";
import { getDropdownOptions } from "../../../../services/catalogService";
import type { AirportOption, AirplaneTypeOption } from "../../../../services/catalogService";
import { ACTION_LABELS } from "../constants/routes.constants";
import { getAllRoutes } from "../services/routeService";
import { STATUS_ACTION_SERVICES } from "../services/routeStatusActions";
import type {
  ResponseRoute,
  RouteStatusAction,
} from "../types/routeTypes";
import { replaceRouteInList } from "../utils/routes.utils";
import { RouteFilters } from "../components/RouteFilters";
import { RouteCreateForm } from "../components/RouteCreateForm";
import { RouteEditForm } from "../components/RouteEditForm";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => axios.isAxiosError<ApiErrorResponse>(unknownError) ? unknownError.response?.data.message ?? fallback : "Ha ocurrido un error inesperado.";

interface State {
  routes: ResponseRoute[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isCreateDrawerOpen: boolean;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: { routes: ResponseRoute[]; page: number; totalPages: number; totalElements: number } }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" }
  | { type: "UPDATE_ROUTE"; payload: ResponseRoute };

const initialState: State = {
  routes: [],
  loading: false,
  error: null,
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
  isCreateDrawerOpen: false,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return {
        ...state,
        loading: false,
        routes: action.payload.routes,
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
      return { ...state, isCreateDrawerOpen: true };
    case "CLOSE_CREATE":
      return { ...state, isCreateDrawerOpen: false };
    case "UPDATE_ROUTE":
      return { ...state, routes: replaceRouteInList(state.routes, action.payload) };
    default:
      return state;
  }
};

export const AdminRoutesPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { routes, loading, error, currentPage, pageSize, totalPages, totalElements, isCreateDrawerOpen } = state;

  const sortedRoutes = routes.toSorted((a, b) =>
    a.flightNumber.localeCompare(b.flightNumber),
  );
  const [selectedRoute, setSelectedRoute] = useState<ResponseRoute | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [airportsData, setAirportsData] = useState<AirportOption[]>([]);
  const [aircraftsData, setAircraftsData] = useState<AirplaneTypeOption[]>([]);
  const [originFilter, setOriginFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [flightNumberFilter, setFlightNumberFilter] = useState("");
  const [pendingStatusAction, setPendingStatusAction] = useState<{ route: ResponseRoute; action: RouteStatusAction } | null>(null);
  const isConfirmationOpen = pendingStatusAction !== null;

  const loadRoutes = async (
    page: number,
    size: number,
    filters?: {
      originAirportIataCode?: string;
      destinationAirportIataCode?: string;
      status?: string;
      flightNumber?: string;
    },
  ) => {
    try {
      dispatch({ type: "LOAD_START" });
      const data = await getAllRoutes(size, page, filters);
      dispatch({ type: "LOAD_SUCCESS", payload: { routes: data.content as ResponseRoute[], page: data.page, totalPages: data.totalPages, totalElements: data.totalElements } });
    } catch (err) {
      console.error(err);
      dispatch({ type: "LOAD_ERROR", payload: "No se han podido cargar las rutas. Por favor, inténtalo de nuevo más tarde." });
    }
  };
  const filterParams = () => ({ originAirportIataCode: originFilter || undefined, destinationAirportIataCode: destFilter || undefined, status: statusFilter || undefined, flightNumber: flightNumberFilter || undefined });
  useEffect(() => {
    let ignore = false;
    dispatch({ type: "LOAD_START" });
    (async () => {
      if (ignore) return;
      try {
        const data = await getAllRoutes(pageSize, currentPage, filterParams());
        if (!ignore) dispatch({ type: "LOAD_SUCCESS", payload: { routes: data.content as ResponseRoute[], page: data.page, totalPages: data.totalPages, totalElements: data.totalElements } });
      } catch (err) {
        if (!ignore) {
          console.error(err);
          dispatch({ type: "LOAD_ERROR", payload: "No se han podido cargar las rutas. Por favor, inténtalo de nuevo más tarde." });
        }
      }
    })();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDropdownOptions();
        setAirportsData(data.airports);
        setAircraftsData(data.airplaneTypes);
      } catch {
        setActionError("Error al cargar datos de catálogo.");
      }
    })();
  }, []);
  const handleSearch = () => {
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadRoutes(0, pageSize, filterParams());
  };
  const handleClearFilters = () => {
    setOriginFilter(""); setDestFilter(""); setStatusFilter(""); setFlightNumberFilter("");
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadRoutes(0, pageSize);
  };
  const handlePageChange = (page: number) => dispatch({ type: "SET_PAGE", payload: page });
  const handlePageSizeChange = (size: number) => dispatch({ type: "SET_PAGE_SIZE", payload: size });
  const closeConfirmationModal = () => setPendingStatusAction(null);
  const handleStatusAction = (flightNumber: string, action: RouteStatusAction) => {
    const route = routes.find((r) => r.flightNumber === flightNumber);
    if (!route) return;
    setPendingStatusAction({ route, action });
  };

  const executePendingAction = async () => {
    if (!pendingStatusAction) return;
    const { route, action } = pendingStatusAction;
    try {
      setIsSubmitting(true);
      setActionError(null);
      const updatedRoute = await STATUS_ACTION_SERVICES[action](route.flightNumber);
      dispatch({ type: "UPDATE_ROUTE", payload: updatedRoute });
      setPendingStatusAction(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo actualizar la ruta."));
    } finally {
      setIsSubmitting(false);
    }
  };
  if (error) { return <ErrorScreen messageTitle="Error al cargar rutas" message={error} />; }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rutas</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => dispatch({ type: "OPEN_CREATE" })} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium">+ Crear Ruta</button>
          <button type="button" onClick={() => loadRoutes(currentPage, pageSize, filterParams())} disabled={loading} title="Refrescar" className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </div>

      <RouteFilters
        originFilter={originFilter}
        onOriginChange={setOriginFilter}
        destFilter={destFilter}
        onDestChange={setDestFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        flightNumberFilter={flightNumberFilter}
        onFlightNumberChange={setFlightNumberFilter}
        loading={loading}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : (
          <RouteTable routes={sortedRoutes} onStatusAction={handleStatusAction} onEdit={(r) => { setSelectedRoute(r); setIsEditOpen(true); }} />
        )}

        <AdminDrawer title={selectedRoute ? `Editar ruta ${selectedRoute.flightNumber}` : "Editar ruta"} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
          {selectedRoute && (
            <RouteEditForm route={selectedRoute} airportsData={airportsData} aircraftsData={aircraftsData} onClose={() => setIsEditOpen(false)} onUpdated={() => loadRoutes(currentPage, pageSize, filterParams())} />
          )}
        </AdminDrawer>

        <AdminDrawer title="Crear Ruta" isOpen={isCreateDrawerOpen} onClose={() => dispatch({ type: "CLOSE_CREATE" })}>
          <RouteCreateForm airportsData={airportsData} aircraftsData={aircraftsData} onClose={() => dispatch({ type: "CLOSE_CREATE" })} onCreated={() => loadRoutes(currentPage, pageSize, filterParams())} />
        </AdminDrawer>

        {isConfirmationOpen && pendingStatusAction ? <ConfirmationModal title="Confirmar acción" message={`¿Desea ${ACTION_LABELS[pendingStatusAction.action].toLowerCase()} la ruta ${pendingStatusAction.route.flightNumber}?`} onConfirm={executePendingAction} onCancel={closeConfirmationModal} error={actionError} isSubmitting={isSubmitting} /> : null}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
    </section>
  );
};
