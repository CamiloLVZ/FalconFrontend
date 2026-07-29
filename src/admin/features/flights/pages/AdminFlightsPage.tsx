import { useCallback, useEffect, useState, useReducer } from "react";
import type { Reducer } from "react";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { Pagination } from "../../../components/Pagination";
import { AdminDrawer } from "../../../components/AdminDrawer";
import { FlightTable } from "../components/FlightTable";
import {
  getAllFlights,
  getFlightById,
} from "../services/flightAdminService";
import type { ResponseFlightDto } from "../types/flightTypes";
import { FlightCreateForm } from "../components/FlightCreateForm";
import { FlightEditForm } from "../components/FlightEditForm";
import { FlightFilters } from "../components/FlightFilters";

interface State {
  flights: ResponseFlightDto[];
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
  | { type: "LOAD_SUCCESS"; payload: { flights: ResponseFlightDto[]; page: number; totalPages: number; totalElements: number } }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" };

const initialState: State = {
  flights: [],
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
        flights: action.payload.flights,
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
    default:
      return state;
  }
};

export const AdminFlightsPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { flights, loading, error, currentPage, pageSize, totalPages, totalElements, isCreateDrawerOpen } = state;

  const [selectedFlight, setSelectedFlight] = useState<ResponseFlightDto | null>(null);
  const [flightNumberInput, setFlightNumberInput] = useState("");
  const [flightIdInput, setFlightIdInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        dispatch({ type: "LOAD_START" });

        if (flightId.trim()) {
          const id = Number(flightId.trim());
          if (Number.isNaN(id) || id <= 0) {
            dispatch({
              type: "LOAD_SUCCESS",
              payload: { flights: [], page: 0, totalPages: 0, totalElements: 0 },
            });
            dispatch({ type: "LOAD_ERROR", payload: "Ingresa un ID de vuelo válido." });
            return;
          }

          const flight = await getFlightById(id);
          dispatch({
            type: "LOAD_SUCCESS",
            payload: { flights: [flight], page: 0, totalPages: 1, totalElements: 1 },
          });
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
        dispatch({
          type: "LOAD_SUCCESS",
          payload: {
            flights: data.content,
            page: data.page,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
          },
        });
      } catch (err) {
        console.error(err);
        dispatch({
          type: "LOAD_SUCCESS",
          payload: { flights: [], page: 0, totalPages: 0, totalElements: 0 },
        });
        dispatch({ type: "LOAD_ERROR", payload: "No se han podido cargar los vuelos." });
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
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadFlights(0, pageSize, flightNumberInput, statusInput, flightIdInput, dateFromInput, dateToInput);
  };

  const handleClearFilters = () => {
    setFlightIdInput("");
    setFlightNumberInput("");
    setStatusInput("");
    setDateFromInput("");
    setDateToInput("");
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadFlights(0, pageSize, "", "", "");
  };

  const handleEditClick = (flight: ResponseFlightDto) => {
    setSelectedFlight(flight);
    setIsDrawerOpen(true);
  };

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Vuelos</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "OPEN_CREATE" })}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium"
          >
            + Crear Vuelo
          </button>
          <button
            type="button"
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

      <FlightFilters
        flightIdInput={flightIdInput}
        onFlightIdChange={setFlightIdInput}
        flightNumberInput={flightNumberInput}
        onFlightNumberChange={setFlightNumberInput}
        statusInput={statusInput}
        onStatusChange={setStatusInput}
        dateFromInput={dateFromInput}
        onDateFromChange={setDateFromInput}
        dateToInput={dateToInput}
        onDateToChange={setDateToInput}
        loading={loading}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

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
        onPageChange={(page) => dispatch({ type: "SET_PAGE", payload: page })}
        onPageSizeChange={(size) => dispatch({ type: "SET_PAGE_SIZE", payload: size })}
      />

      <AdminDrawer
        title="Crear Vuelo"
        isOpen={isCreateDrawerOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE" })}
      >
        <FlightCreateForm
          onClose={() => dispatch({ type: "CLOSE_CREATE" })}
          onCreated={() => loadFlights(currentPage, pageSize, flightNumberInput, statusInput, flightIdInput, dateFromInput, dateToInput)}
        />
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
          <FlightEditForm
            flight={selectedFlight}
            onUpdated={() => loadFlights(currentPage, pageSize, flightNumberInput, statusInput, flightIdInput)}
          />
        )}
      </AdminDrawer>
    </section>
  );
};
