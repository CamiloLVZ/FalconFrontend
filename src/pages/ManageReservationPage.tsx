import { useEffect, useReducer } from "react";
import type { Reducer } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getReservation, cancelReservation } from "../admin/features/reservations/services/reservationService";
import { downloadBoardingPass } from "../admin/features/boarding/services/boardingService";
import { useAuth } from "../auth/hooks/useAuth";
import type { Reservation } from "../admin/features/reservations/types/reservationTypes";
import type { ApiErrorResponse } from "../types/ApiError";
import { formatDuration, getArrivalTime } from "../utils/date-times";
import { AirplaneDepartureIcon } from "../components/icons/AirplaneDepartureIcon";
import { AirplaneArrivalIcon } from "../components/icons/AirplaneArrivalIcon";
import { AirplaneIcon } from "../components/icons/AirplaneIcon";

type View = "search" | "result";

const statusLabel: Record<string, string> = {
  RESERVED: "Reservado",
  COMPLETED: "Completado",
  CANCELED: "Cancelado",
};

const passengerStatusLabel: Record<string, string> = {
  RESERVED: "Reservado",
  CHECKED_IN: "Check-in realizado",
  BOARDED: "Abordó",
  CANCELED: "Cancelado",
  EXPIRED: "Expirado",
};

const statusColor: Record<string, string> = {
  RESERVED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-green-100 text-green-700",
  BOARDED: "bg-green-100 text-green-700",
  CANCELED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    if (unknownError.response?.status === 404) {
      return "Reserva no encontrada. Verifica el número y el correo electrónico.";
    }
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

type ManageField = "reservationNumber" | "contactEmail";

interface ManageState {
  view: View;
  reservationNumber: string;
  contactEmail: string;
  loading: boolean;
  error: string | null;
  reservation: Reservation | null;
  cancelling: boolean;
  cancelConfirm: boolean;
}

type ManageAction =
  | { type: "SET_FIELD"; field: ManageField; value: string }
  | { type: "SEARCH_START" }
  | { type: "SEARCH_SUCCESS"; reservation: Reservation }
  | { type: "SEARCH_ERROR"; message: string }
  | { type: "CANCEL_START" }
  | { type: "CANCEL_SUCCESS"; reservation: Reservation }
  | { type: "CANCEL_ERROR"; message: string }
  | { type: "SET_CANCEL_CONFIRM"; value: boolean }
  | { type: "NEW_SEARCH" };

const manageReducer: Reducer<ManageState, ManageAction> = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SEARCH_START":
      return { ...state, loading: true, error: null, reservation: null, cancelConfirm: false };
    case "SEARCH_SUCCESS":
      return { ...state, loading: false, reservation: action.reservation, view: "result" };
    case "SEARCH_ERROR":
      return { ...state, loading: false, error: action.message };
    case "CANCEL_START":
      return { ...state, cancelling: true, error: null };
    case "CANCEL_SUCCESS":
      return { ...state, cancelling: false, reservation: action.reservation, cancelConfirm: false };
    case "CANCEL_ERROR":
      return { ...state, cancelling: false, error: action.message };
    case "SET_CANCEL_CONFIRM":
      return { ...state, cancelConfirm: action.value };
    case "NEW_SEARCH":
      return { ...state, view: "search", reservation: null, error: null, cancelConfirm: false };
  }
};

export const ManageReservationPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(manageReducer, {
    view: "search",
    reservationNumber: "",
    contactEmail: user?.email || "",
    loading: false,
    error: null,
    reservation: null,
    cancelling: false,
    cancelConfirm: false,
  });

  useEffect(() => {
    if (isAuthenticated && !state.contactEmail && user?.email) {
      dispatch({ type: "SET_FIELD", field: "contactEmail", value: user.email });
    }
  }, [isAuthenticated, user?.email, state.contactEmail]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.reservationNumber.trim() || !state.contactEmail.trim()) return;

    try {
      dispatch({ type: "SEARCH_START" });

      const data = await getReservation(state.reservationNumber.trim(), state.contactEmail.trim());
      dispatch({ type: "SEARCH_SUCCESS", reservation: data });
    } catch (err) {
      dispatch({ type: "SEARCH_ERROR", message: getApiErrorMessage(err, "No se pudo obtener la reserva.") });
    }
  };

  const handleCancel = async () => {
    if (!state.reservation) return;

    try {
      dispatch({ type: "CANCEL_START" });

      const updated = await cancelReservation(state.reservation.number, state.reservation.contactEmail);
      dispatch({ type: "CANCEL_SUCCESS", reservation: updated });
    } catch (err) {
      dispatch({ type: "CANCEL_ERROR", message: getApiErrorMessage(err, "No se pudo cancelar la reserva.") });
    }
  };

  const handleNewSearch = () => {
    dispatch({ type: "NEW_SEARCH" });
  };

  const checkInAvailable = state.reservation?.flight?.status === "CHECK_IN_AVAILABLE";

  const handleGoToCheckIn = (identification: string, country: string) => {
    const params = new URLSearchParams({
      reservation: state.reservation!.number,
      email: state.reservation!.contactEmail,
      identification,
      country,
    });
    navigate(`/check-in?${params.toString()}`);
  };

  if (state.view === "result" && state.reservation) {
    const reservation = state.reservation;
    const flight = reservation.flight;
    const hasActivePassengers = reservation.passengers.some((p) => p.status === "RESERVED" || p.status === "CHECKED_IN");

    return (
      <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Reserva {reservation.number}</h1>
            <button
              type="button"
              onClick={handleNewSearch}
              className="px-4 py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300 transition cursor-pointer font-medium"
            >
              Nueva búsqueda
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">{flight.flightNumber}</span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[reservation.status] || "bg-gray-100 text-gray-600"}`}>
                {statusLabel[reservation.status] || reservation.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="flex justify-center mb-1 text-gray-400"><AirplaneDepartureIcon /></div>
                <p className="text-xl font-semibold">{flight.localDepartureDateTime.slice(11, 16)}</p>
                <p className="text-sm text-gray-800 font-medium">{flight.origin}</p>
              </div>
              <div className="flex-1 mx-4 text-center">
                <p className="text-xs text-gray-500 mb-1">{formatDuration(flight.durationMinutes)}</p>
                <div className="flex items-center">
                  <div className="h-[2px] bg-gray-300 flex-1" />
                  <span className="mx-2 rotate-45 text-gray-400"><AirplaneIcon /></span>
                  <div className="h-[2px] bg-gray-300 flex-1" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Directo</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1 text-gray-400"><AirplaneArrivalIcon /></div>
                <p className="text-xl font-semibold">{getArrivalTime(flight.localDepartureDateTime, flight.durationMinutes)}</p>
                <p className="text-sm text-gray-800 font-medium">{flight.destination}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600 flex justify-between">
              <p><span className="font-medium">Fecha:</span> {flight.localDepartureDateTime.slice(0, 10)}</p>
              <p><span className="font-medium">Email:</span> {reservation.contactEmail}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h2 className="text-lg font-bold mb-3">Pasajeros</h2>
            <div className="space-y-3">
              {reservation.passengers.map((pr, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {pr.passenger.firstName} {pr.passenger.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {pr.seatLabel && `${pr.seatLabel} · `}{pr.seatClass === "FIRST_CLASS" ? "Primera clase" : "Económico"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {checkInAvailable && pr.status === "RESERVED" ? (
                      <button
                        type="button"
                        onClick={() => handleGoToCheckIn(pr.passenger.identificationNumber, pr.passenger.nationalityIsoCode)}
                        className="text-xs px-4 py-2 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition cursor-pointer whitespace-nowrap"
                      >
                        Hacer check-in
                      </button>
                    ) : (
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[pr.status] || "bg-gray-100 text-gray-600"}`}>
                        {passengerStatusLabel[pr.status] || pr.status}
                      </span>
                    )}
                    {(pr.status === "CHECKED_IN" || pr.status === "BOARDED") && (
                      <button
                        type="button"
                        onClick={() => downloadBoardingPass(pr.id)}
                        className="text-xs px-3 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer whitespace-nowrap"
                        title="Descargar boarding pass"
                      >
                        Pasabordo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {reservation.status === "RESERVED" && hasActivePassengers && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {!state.cancelConfirm ? (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SET_CANCEL_CONFIRM", value: true })}
                  className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition cursor-pointer"
                >
                  Cancelar reserva
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-red-700 font-medium mb-3">
                    ¿Estás seguro de cancelar toda la reserva?
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "SET_CANCEL_CONFIRM", value: false })}
                      disabled={state.cancelling}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition cursor-pointer disabled:opacity-50"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={state.cancelling}
                      className="flex-1 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
                    >
                      {state.cancelling ? "Cancelando..." : "Sí, cancelar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {state.error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mt-4 text-sm font-medium">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium">{state.error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Gestionar reserva</h1>
          <p className="text-gray-500 mt-2">Ingresa los datos de tu reserva para consultarla</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="manage-reservationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Número de reserva
              </label>
              <input
                type="text"
                id="manage-reservationNumber"
                value={state.reservationNumber}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "reservationNumber", value: e.target.value })}
                placeholder="Ej: ABC123"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label htmlFor="manage-contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico de contacto
              </label>
              <input
                type="email"
                id="manage-contactEmail"
                value={state.contactEmail}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "contactEmail", value: e.target.value })}
                placeholder="Ej: contacto@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {state.error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm font-medium">{state.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={state.loading}
              className={`w-full py-3 rounded-xl font-semibold text-lg transition cursor-pointer ${
                state.loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 text-black hover:bg-yellow-300"
              }`}
            >
              {state.loading ? "Buscando..." : "Buscar reserva"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
