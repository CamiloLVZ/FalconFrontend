import { useEffect, useState, useReducer } from "react";
import type { Reducer } from "react";
import axios from "axios";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { Pagination } from "../../../components/Pagination";
import { AdminDrawer } from "../../../components/AdminDrawer";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { PassengerTable } from "../components/PassengerTable";
import {
  getAllPassengers,
  getPassengersByFlight,
  getPassengerByPassport,
  getPassengerByIdentification,
} from "../services/passengerService";
import type { Passenger, PassengerSearchMode } from "../types/passengerTypes";
import { PassengerCreateForm } from "../components/PassengerCreateForm";
import { PassengerDetailsDrawer } from "../components/PassengerDetailsDrawer";
import { PassengerFilters } from "../components/PassengerFilters";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface State {
  passengers: Passenger[];
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
  | { type: "LOAD_SUCCESS"; payload: { passengers: Passenger[]; page: number; totalPages: number; totalElements: number } }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" };

const initialState: State = {
  passengers: [],
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
        passengers: action.payload.passengers,
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

export const AdminPassengersPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { passengers, loading, error, currentPage, pageSize, totalPages, totalElements, isCreateDrawerOpen } = state;

  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [searchMode, setSearchMode] = useState<PassengerSearchMode>("all");
  const [flightIdInput, setFlightIdInput] = useState("");
  const [passportInput, setPassportInput] = useState("");
  const [identificationInput, setIdentificationInput] = useState("");
  const [countryCodeInput, setCountryCodeInput] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadPassengers = async (
    page: number,
    size: number,
    modeOverride?: PassengerSearchMode,
  ) => {
    const mode = modeOverride ?? searchMode;
    try {
      dispatch({ type: "LOAD_START" });
      if (mode === "all") {
        const data = await getAllPassengers(page, size);
        dispatch({
          type: "LOAD_SUCCESS",
          payload: { passengers: data.content, page: data.page, totalPages: data.totalPages, totalElements: data.totalElements },
        });
      } else if (mode === "by-flight") {
        const id = parseInt(flightIdInput, 10);
        if (isNaN(id)) {
          dispatch({ type: "LOAD_ERROR", payload: "Ingrese un ID de vuelo válido." });
          return;
        }
        const data = await getPassengersByFlight(id, page, size);
        dispatch({
          type: "LOAD_SUCCESS",
          payload: { passengers: data.content, page: data.page, totalPages: data.totalPages, totalElements: data.totalElements },
        });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: "LOAD_ERROR", payload: "No se han podido cargar los pasajeros." });
    }
  };

  const handleSingleSearch = async () => {
    try {
      dispatch({ type: "LOAD_START" });

      if (searchMode === "by-passport") {
        if (!passportInput.trim()) {
          dispatch({ type: "LOAD_ERROR", payload: "Ingrese un número de pasaporte." });
          return;
        }
        const passenger = await getPassengerByPassport(passportInput.trim());
        dispatch({
          type: "LOAD_SUCCESS",
          payload: { passengers: [passenger], page: 0, totalPages: 1, totalElements: 1 },
        });
      } else if (searchMode === "by-identification") {
        if (!identificationInput.trim() || !countryCodeInput.trim()) {
          dispatch({ type: "LOAD_ERROR", payload: "Ingrese el número de identificación y el código de país." });
          return;
        }
        const passenger = await getPassengerByIdentification(
          identificationInput.trim(),
          countryCodeInput.trim().toUpperCase(),
        );
        dispatch({
          type: "LOAD_SUCCESS",
          payload: { passengers: [passenger], page: 0, totalPages: 1, totalElements: 1 },
        });
      }
    } catch (err) {
      console.error(err);
      const msg = getApiErrorMessage(err, "No se encontró el pasajero.");
      dispatch({ type: "LOAD_ERROR", payload: msg });
      dispatch({
        type: "LOAD_SUCCESS",
        payload: { passengers: [], page: 0, totalPages: 0, totalElements: 0 },
      });
    }
  };

  const handleModeChange = (mode: PassengerSearchMode) => {
    setSearchMode(mode);
    dispatch({
      type: "LOAD_SUCCESS",
      payload: { passengers: [], page: 0, totalPages: 0, totalElements: 0 },
    });
    if (mode === "all") {
      loadPassengers(0, pageSize, mode);
    }
  };

  const handleFlightSearch = () => {
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadPassengers(0, pageSize);
  };

  const handleEditClick = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setIsDrawerOpen(true);
  };

  const handleRefresh = () => {
    if (searchMode === "all" || searchMode === "by-flight") { loadPassengers(currentPage, pageSize); }
    else { handleSingleSearch(); }
  };
  const showPagination = searchMode === "all" || searchMode === "by-flight";

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Pasajeros</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "OPEN_CREATE" })}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium"
          >
            + Crear Pasajero
          </button>
          <button
            type="button"
            onClick={handleRefresh}
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

      <PassengerFilters
        searchMode={searchMode}
        flightIdInput={flightIdInput}
        onFlightIdChange={setFlightIdInput}
        passportInput={passportInput}
        onPassportChange={setPassportInput}
        identificationInput={identificationInput}
        onIdentificationChange={setIdentificationInput}
        countryCodeInput={countryCodeInput}
        onCountryCodeChange={setCountryCodeInput}
        onModeChange={handleModeChange}
        onFlightSearch={handleFlightSearch}
        onSingleSearch={handleSingleSearch}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : (
          <PassengerTable passengers={passengers} onEdit={handleEditClick} />
        )}
      </div>

      {showPagination && !loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={(page) => {
            dispatch({ type: "SET_PAGE", payload: page });
            loadPassengers(page, pageSize);
          }}
          onPageSizeChange={(size) => {
            dispatch({ type: "SET_PAGE_SIZE", payload: size });
            loadPassengers(0, size);
          }}
        />
      )}

      <AdminDrawer
        title="Crear Pasajero"
        isOpen={isCreateDrawerOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE" })}
      >
        <PassengerCreateForm
          onClose={() => dispatch({ type: "CLOSE_CREATE" })}
          onCreated={handleRefresh}
        />
      </AdminDrawer>

      <AdminDrawer
        title={
          selectedPassenger
            ? `Pasajero: ${selectedPassenger.firstName} ${selectedPassenger.lastName}`
            : "Pasajero"
        }
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedPassenger && (
          <PassengerDetailsDrawer passenger={selectedPassenger} />
        )}
      </AdminDrawer>
    </section>
  );
};
