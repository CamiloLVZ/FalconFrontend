import { useEffect, useReducer, useState } from "react";
import type { Reducer } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { checkInPassenger, getReservation } from "../admin/features/reservations/services/reservationService";
import { downloadBoardingPass } from "../admin/features/boarding/services/boardingService";
import type { CheckInResponse, Reservation } from "../admin/features/reservations/types/reservationTypes";
import type { ApiErrorResponse } from "../types/ApiError";
import { getAllCountries } from "../services/countryService";
import { getFlightSeatMap } from "../services/flightService";
import { getMyProfile } from "../services/userProfileService";
import { useAuth } from "../auth/hooks/useAuth";
import type { Country } from "../types/country";
import type { FlightSeatMap } from "../types/seatMap";
import type { SeatClass } from "../types/seatMap";
import { AirplaneSeatMap } from "../components/features/checkin/AirplaneSeatMap";
import imgLogo from "../assets/logo/logo.png";

type CheckInPhase = "form" | "seat-selection" | "success";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

type CheckInFormField = "reservationNumber" | "contactEmail" | "identificationNumber" | "countryIsoCode";

interface CheckInFormState {
  reservationNumber: string;
  contactEmail: string;
  identificationNumber: string;
  countryIsoCode: string;
}

type CheckInFormAction =
  | { type: "SET_FIELD"; field: CheckInFormField; value: string }
  | { type: "RESET_FORM"; contactEmail: string };

const formReducer: Reducer<CheckInFormState, CheckInFormAction> = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET_FORM":
      return { reservationNumber: "", contactEmail: action.contactEmail, identificationNumber: "", countryIsoCode: "" };
  }
};

interface FlowState {
  phase: CheckInPhase;
  reservation: Reservation | null;
  seatMap: FlightSeatMap | null;
  passengerClass: SeatClass;
  loading: boolean;
  checkInLoading: boolean;
  error: string | null;
  successData: CheckInResponse | null;
}

type FlowAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; reservation: Reservation; passengerClass: SeatClass }
  | { type: "SEAT_MAP_LOADED"; seatMap: FlightSeatMap }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "SET_PHASE"; phase: CheckInPhase }
  | { type: "CHECK_IN_START" }
  | { type: "CHECK_IN_SUCCESS"; data: CheckInResponse }
  | { type: "CHECK_IN_ERROR"; message: string }
  | { type: "BACK_TO_FORM" }
  | { type: "RESET_FLOW" };

const initialFlowState: FlowState = {
  phase: "form",
  reservation: null,
  seatMap: null,
  passengerClass: "ECONOMY",
  loading: false,
  checkInLoading: false,
  error: null,
  successData: null,
};

const flowReducer: Reducer<FlowState, FlowAction> = (state, action) => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return { ...state, loading: false, reservation: action.reservation, passengerClass: action.passengerClass };
    case "SEAT_MAP_LOADED":
      return { ...state, seatMap: action.seatMap };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.message };
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "CHECK_IN_START":
      return { ...state, checkInLoading: true, error: null };
    case "CHECK_IN_SUCCESS":
      return { ...state, checkInLoading: false, successData: action.data, phase: "success" };
    case "CHECK_IN_ERROR":
      return { ...state, checkInLoading: false, error: action.message };
    case "BACK_TO_FORM":
      return { ...state, phase: "form", seatMap: null, reservation: null, error: null };
    case "RESET_FLOW":
      return initialFlowState;
  }
};

const CheckInLoadingOverlay = ({ label }: { label: string }) => (
  <div className="fixed inset-0 z-50 bg-white/80 flex flex-col items-center justify-center">
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-24 overflow-hidden rounded-xl">
          <img src={imgLogo} alt="Falcon logo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-blue-600 opacity-30 animate-pulse" style={{ animation: "fillAnimation 2s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
    <p className="text-lg font-semibold text-gray-700 mt-4">{label}</p>
    <style>{`@keyframes fillAnimation { 0%,100% { opacity: 0.1; } 50% { opacity: 0.4; } }`}</style>
  </div>
);

interface CheckInSuccessViewProps {
  data: CheckInResponse;
  onDownload: () => void;
  onNewCheckIn: () => void;
}

const CheckInSuccessView = ({ data, onDownload, onNewCheckIn }: CheckInSuccessViewProps) => (
  <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Check-in exitoso</h2>
        <p className="text-gray-500 mb-6">Tu check-in se ha realizado correctamente</p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-2 mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Pasajero:</span>{" "}
            {data.passenger.firstName} {data.passenger.lastName}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Asiento:</span>{" "}
            {data.seatLabel} ({data.seatClass === "FIRST_CLASS" ? "Primera clase" : "Económico"})
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Estado:</span>{" "}
            <span className="text-green-600 font-medium">Check-in realizado</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onDownload}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer mb-3"
        >
          Descargar boarding pass
        </button>

        <button
          type="button"
          onClick={onNewCheckIn}
          className="w-full py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition cursor-pointer"
        >
          Realizar otro check-in
        </button>
      </div>
    </div>
  </div>
);

interface CheckInSeatSelectionViewProps {
  reservation: Reservation;
  seatMap: FlightSeatMap;
  passengerClass: SeatClass;
  error: string | null;
  loading: boolean;
  onBack: () => void;
  onSeatConfirmed: (seatNumber: number) => void;
}

const CheckInSeatSelectionView = ({ reservation, seatMap, passengerClass, error, loading, onBack, onSeatConfirmed }: CheckInSeatSelectionViewProps) => (
  <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
    <div className="w-full" style={{ maxWidth: "900px" }}>
      <button type="button" className="seat-phase-back" onClick={onBack}>
        ← Atrás
      </button>

      <div className="seat-phase-header">
        <h2>Selecciona tu asiento</h2>
        <p>
          Vuelo {reservation.flight.flightNumber} · {reservation.flight.origin} → {reservation.flight.destination}
          {" · "}
          {passengerClass === "FIRST_CLASS" ? "Primera Clase" : "Clase Económica"}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 max-w-lg mx-auto text-sm font-medium">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <AirplaneSeatMap
        seatMap={seatMap}
        passengerClass={passengerClass}
        onSeatConfirmed={onSeatConfirmed}
        loading={loading}
      />

      {loading && <CheckInLoadingOverlay label="Procesando check-in..." />}
    </div>
  </div>
);

interface CheckInFormViewProps {
  reservationNumber: string;
  contactEmail: string;
  identificationNumber: string;
  countryIsoCode: string;
  countries: Country[];
  loading: boolean;
  error: string | null;
  onFieldChange: (field: CheckInFormField, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CheckInFormView = ({ reservationNumber, contactEmail, identificationNumber, countryIsoCode, countries, loading, error, onFieldChange, onSubmit }: CheckInFormViewProps) => (
  <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
    <div className="w-full max-w-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Check-in</h1>
        <p className="text-gray-500 mt-2">Realiza tu check-in online ingresando tus datos</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="checkin-reservationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de reserva
            </label>
            <input
              type="text"
              id="checkin-reservationNumber"
              value={reservationNumber}
              onChange={(e) => onFieldChange("reservationNumber", e.target.value)}
              placeholder="Ej: ABC123"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label htmlFor="checkin-contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico de contacto
            </label>
            <input
              type="email"
              id="checkin-contactEmail"
              value={contactEmail}
              onChange={(e) => onFieldChange("contactEmail", e.target.value)}
              placeholder="Ej: contacto@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label htmlFor="checkin-identificationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de identificación del pasajero
            </label>
            <input
              type="text"
              id="checkin-identificationNumber"
              value={identificationNumber}
              onChange={(e) => onFieldChange("identificationNumber", e.target.value)}
              placeholder="Ej: 1032456789"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label htmlFor="checkin-countryIsoCode" className="block text-sm font-medium text-gray-700 mb-1">
              País de identificación
            </label>
            <select
              id="checkin-countryIsoCode"
              value={countryIsoCode}
              onChange={(e) => onFieldChange("countryIsoCode", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
            >
              <option value="">Seleccionar país</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition cursor-pointer ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 text-black hover:bg-yellow-300"
            }`}
          >
            {loading ? "Validando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>

    {loading && <CheckInLoadingOverlay label="Validando reserva..." />}
  </div>
);

export const CheckInPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, formDispatch] = useReducer(formReducer, {
    reservationNumber: searchParams.get("reservation") || "",
    contactEmail: searchParams.get("email") || (user?.email ?? ""),
    identificationNumber: searchParams.get("identification") || "",
    countryIsoCode: searchParams.get("country") || "",
  });
  const [flow, flowDispatch] = useReducer(flowReducer, initialFlowState);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    getAllCountries().then(setCountries).catch(() => {});
  }, []);

  // Autofill user profile data if authenticated and fields not provided by search params
  useEffect(() => {
    if (isAuthenticated) {
      if (!form.contactEmail && user?.email) {
        formDispatch({ type: "SET_FIELD", field: "contactEmail", value: user.email });
      }
      getMyProfile()
        .then((profile) => {
          if (profile) {
            if (!form.identificationNumber && profile.identificationNumber) {
              formDispatch({ type: "SET_FIELD", field: "identificationNumber", value: profile.identificationNumber });
            }
            if (!form.countryIsoCode && profile.nationalityIsoCode) {
              formDispatch({ type: "SET_FIELD", field: "countryIsoCode", value: profile.nationalityIsoCode });
            }
          }
        })
        .catch(() => {
          // User might not have created a passenger profile yet
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.email]);

  /** Phase 1: validate reservation and fetch seat map */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reservationNumber || !form.contactEmail || !form.identificationNumber || !form.countryIsoCode) return;

    try {
      flowDispatch({ type: "LOAD_START" });

      const res = await getReservation(form.reservationNumber.trim(), form.contactEmail.trim());
      const flightStatus = res.flight.status;

      if (flightStatus === "BOARDING" || flightStatus === "GATE_CLOSED") {
        flowDispatch({ type: "LOAD_ERROR", message: "El abordaje ya ha comenzado. No se permiten check-ins en este momento." });
        return;
      }
      if (flightStatus === "COMPLETED") {
        flowDispatch({ type: "LOAD_ERROR", message: "Este vuelo ya ha sido completado." });
        return;
      }
      if (flightStatus === "CANCELED") {
        flowDispatch({ type: "LOAD_ERROR", message: "Este vuelo ha sido cancelado." });
        return;
      }
      if (flightStatus === "SCHEDULED") {
        flowDispatch({ type: "LOAD_ERROR", message: "El check-in aún no está disponible para este vuelo." });
        return;
      }

      // Find the passenger in the reservation to determine their class
      const passenger = res.passengers.find(
        (p) => p.status === "RESERVED"
      );

      if (!passenger) {
        flowDispatch({ type: "LOAD_ERROR", message: "No se encontró un pasajero con estado reservado en esta reserva." });
        return;
      }

      flowDispatch({ type: "LOAD_SUCCESS", reservation: res, passengerClass: passenger.seatClass });

      // Fetch seat map
      const map = await getFlightSeatMap(res.flight.id);
      flowDispatch({ type: "SEAT_MAP_LOADED", seatMap: map });

      flowDispatch({ type: "SET_PHASE", phase: "seat-selection" });
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response?.status === 404) {
        flowDispatch({ type: "LOAD_ERROR", message: "Reserva no encontrada. Verifica los datos ingresados." });
      } else {
        flowDispatch({ type: "LOAD_ERROR", message: getApiErrorMessage(err, "No se pudo validar la reserva.") });
      }
    }
  };

  /** Phase 2: confirm seat and perform check-in */
  const handleSeatConfirmed = async (seatNumber: number) => {
    try {
      flowDispatch({ type: "CHECK_IN_START" });

      const result = await checkInPassenger(
        form.reservationNumber.trim(),
        form.contactEmail.trim(),
        form.identificationNumber.trim(),
        form.countryIsoCode,
        seatNumber,
      );

      flowDispatch({ type: "CHECK_IN_SUCCESS", data: result });
    } catch (err) {
      flowDispatch({ type: "CHECK_IN_ERROR", message: getApiErrorMessage(err, "No se pudo realizar el check-in.") });
    }
  };

  const handleNewCheckIn = () => {
    flowDispatch({ type: "RESET_FLOW" });
    formDispatch({ type: "RESET_FORM", contactEmail: user?.email || "" });
  };

  const handleBackToForm = () => {
    flowDispatch({ type: "BACK_TO_FORM" });
  };

  if (flow.phase === "success" && flow.successData) {
    return (
      <CheckInSuccessView
        data={flow.successData}
        onDownload={() => downloadBoardingPass(flow.successData!.id)}
        onNewCheckIn={handleNewCheckIn}
      />
    );
  }

  if (flow.phase === "seat-selection" && flow.seatMap && flow.reservation) {
    return (
      <CheckInSeatSelectionView
        reservation={flow.reservation}
        seatMap={flow.seatMap}
        passengerClass={flow.passengerClass}
        error={flow.error}
        loading={flow.checkInLoading}
        onBack={handleBackToForm}
        onSeatConfirmed={handleSeatConfirmed}
      />
    );
  }

  return (
    <CheckInFormView
      reservationNumber={form.reservationNumber}
      contactEmail={form.contactEmail}
      identificationNumber={form.identificationNumber}
      countryIsoCode={form.countryIsoCode}
      countries={countries}
      loading={flow.loading}
      error={flow.error}
      onFieldChange={(field, value) => formDispatch({ type: "SET_FIELD", field, value })}
      onSubmit={handleFormSubmit}
    />
  );
};
