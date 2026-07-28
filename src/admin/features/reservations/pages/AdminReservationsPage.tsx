import { useState, useReducer, type FormEvent, type Reducer } from "react";
import axios from "axios";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import type { ApiErrorResponse } from "../../../../types/ApiError";

import { ReservationTable } from "../components/ReservationTable";
import { ReservationSearchForm } from "../components/ReservationSearchForm";
import { ReservationDetailDrawer } from "../components/ReservationDetailDrawer";
import {
  getReservation,
  getReservationsByFlight,
  cancelReservation,
  cancelPassengerFromReservation,
} from "../services/reservationService";
import type { Reservation, PassengerReservation } from "../types/reservationTypes";

interface State {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  isSubmitting: boolean;
  actionError: string | null;
  isDrawerOpen: boolean;
  selectedReservation: Reservation | null;
  hasSearched: boolean;
  lastSearchType: "flight" | "number" | null;
}

type Action =
  | { type: "SEARCH_START" }
  | { type: "SEARCH_FLIGHT_SUCCESS"; payload: Reservation[] }
  | { type: "SEARCH_NUMBER_SUCCESS"; payload: Reservation }
  | { type: "SEARCH_FLIGHT_ERROR" }
  | { type: "SEARCH_NUMBER_ERROR" }
  | { type: "EDIT_RESERVATION"; payload: Reservation }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; payload: Reservation }
  | { type: "SUBMIT_ERROR"; payload: string }
  | { type: "CLOSE_DRAWER" };

const initialState: State = {
  reservations: [],
  loading: false,
  error: null,
  isSubmitting: false,
  actionError: null,
  isDrawerOpen: false,
  selectedReservation: null,
  hasSearched: false,
  lastSearchType: null,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "SEARCH_START":
      return { ...state, loading: true, error: null, actionError: null };
    case "SEARCH_FLIGHT_SUCCESS":
      return {
        ...state,
        loading: false,
        reservations: action.payload,
        selectedReservation: null,
        isDrawerOpen: false,
        lastSearchType: "flight",
        hasSearched: true,
        error: null,
      };
    case "SEARCH_NUMBER_SUCCESS":
      return {
        ...state,
        loading: false,
        reservations: [action.payload],
        selectedReservation: action.payload,
        isDrawerOpen: true,
        lastSearchType: "number",
        hasSearched: true,
        error: null,
      };
    case "SEARCH_FLIGHT_ERROR":
      return {
        ...state,
        loading: false,
        error: "No se han podido cargar las reservas del vuelo.",
      };
    case "SEARCH_NUMBER_ERROR":
      return {
        ...state,
        loading: false,
        error: "No se encontró ninguna reserva con ese número.",
        selectedReservation: null,
        isDrawerOpen: false,
      };
    case "EDIT_RESERVATION":
      return {
        ...state,
        selectedReservation: action.payload,
        actionError: null,
        isDrawerOpen: true,
      };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true, actionError: null };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        isSubmitting: false,
        actionError: null,
        reservations: state.reservations.map((r) =>
          r.number === action.payload.number ? action.payload : r,
        ),
      };
    case "SUBMIT_ERROR":
      return { ...state, isSubmitting: false, actionError: action.payload };
    case "CLOSE_DRAWER":
      return { ...state, isDrawerOpen: false };
    default:
      return state;
  }
};

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

export const AdminReservationsPage = () => {
  const [flightId, setFlightId] = useState("");
  const [reservationNumberInput, setReservationNumberInput] = useState("");
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!flightId.trim()) return;

    try {
      dispatch({ type: "SEARCH_START" });
      const pagedResponse = await getReservationsByFlight(
        Number(flightId),
        0,
        10,
      );
      dispatch({ type: "SEARCH_FLIGHT_SUCCESS", payload: pagedResponse.content });
    } catch (err) {
      console.error(err);
      dispatch({ type: "SEARCH_FLIGHT_ERROR" });
    }
  };

  const handleSearchByReservationNumber = async (e: FormEvent) => {
    e.preventDefault();
    const reservationNumber = reservationNumberInput.trim();

    if (!reservationNumber) return;

    try {
      dispatch({ type: "SEARCH_START" });
      const reservation = await getReservation(reservationNumber);
      dispatch({ type: "SEARCH_NUMBER_SUCCESS", payload: reservation });
    } catch (err) {
      console.error(err);
      dispatch({ type: "SEARCH_NUMBER_ERROR" });
    }
  };

  const handleEditClick = (reservation: Reservation) => {
    dispatch({ type: "EDIT_RESERVATION", payload: reservation });
  };

  const handleCancelReservation = async () => {
    if (!state.selectedReservation) return;

    if (
      !window.confirm(
        `¿Estás seguro de que deseas cancelar la reserva ${state.selectedReservation.number}?`,
      )
    ) {
      return;
    }

    try {
      dispatch({ type: "SUBMIT_START" });

      const updatedReservation = await cancelReservation(
        state.selectedReservation.number,
        state.selectedReservation.contactEmail,
      );

      dispatch({ type: "SUBMIT_SUCCESS", payload: updatedReservation });
    } catch (err) {
      dispatch({
        type: "SUBMIT_ERROR",
        payload: getApiErrorMessage(err, "No se pudo cancelar la reserva."),
      });
    }
  };

  const handleCancelPassenger = async (passenger: PassengerReservation) => {
    if (!state.selectedReservation) return;

    if (
      !window.confirm(
        `¿Estás seguro de que deseas cancelar el pasajero ${passenger.passenger.firstName} ${passenger.passenger.lastName} de la reserva ${state.selectedReservation.number}?`,
      )
    ) {
      return;
    }

    try {
      dispatch({ type: "SUBMIT_START" });

      const updatedReservation = await cancelPassengerFromReservation(
        state.selectedReservation.number,
        state.selectedReservation.contactEmail,
        passenger.passenger.identificationNumber,
        passenger.passenger.nationalityIsoCode,
      );

      dispatch({ type: "SUBMIT_SUCCESS", payload: updatedReservation });
    } catch (err) {
      dispatch({
        type: "SUBMIT_ERROR",
        payload: getApiErrorMessage(err, "No se pudo cancelar el pasajero."),
      });
    }
  };

  const handleRefresh = () => {
    if (state.lastSearchType === "flight" && flightId.trim()) {
      handleSearch(new Event("submit") as unknown as React.FormEvent);
    } else if (state.lastSearchType === "number" && reservationNumberInput.trim()) {
      handleSearchByReservationNumber(
        new Event("submit") as unknown as React.FormEvent,
      );
    }
  };

  if (state.error) {
    return <ErrorScreen messageTitle="Error" message={state.error} />;
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Reservas</h1>
        {state.hasSearched && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={state.loading}
            title="Refrescar"
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      <ReservationSearchForm
        flightId={flightId}
        reservationNumberInput={reservationNumberInput}
        loading={state.loading}
        onFlightIdChange={setFlightId}
        onReservationNumberChange={setReservationNumberInput}
        onSearchByFlight={handleSearch}
        onSearchByNumber={handleSearchByReservationNumber}
      />

      <div className="mt-4 overflow-x-auto">
        {state.loading ? (
          <LoadingScreen />
        ) : !state.hasSearched ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm text-gray-500">
            Ingresa un ID de vuelo o un número de reserva para consultar la
            información.
          </div>
        ) : state.reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm text-gray-500">
            No se encontraron reservas para el vuelo especificado.
          </div>
        ) : (
          <ReservationTable
            reservations={state.reservations}
            onEdit={handleEditClick}
          />
        )}
      </div>

      <ReservationDetailDrawer
        selectedReservation={state.selectedReservation}
        isSubmitting={state.isSubmitting}
        actionError={state.actionError}
        isDrawerOpen={state.isDrawerOpen}
        onClose={() => dispatch({ type: "CLOSE_DRAWER" })}
        onCancelReservation={handleCancelReservation}
        onCancelPassenger={handleCancelPassenger}
      />
    </section>
  );
};
