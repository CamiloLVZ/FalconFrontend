import { useEffect, useReducer, useState } from "react";
import type { Reducer } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/hooks/useAuth";
import { getMyProfile, createMyProfile, updateMyProfile } from "../services/userProfileService";
import { getMyReservations, cancelMyReservation, cancelMyPassengerReservation } from "../services/myReservationsService";
import { getAllCountries } from "../services/countryService";
import { downloadBoardingPass } from "../admin/features/boarding/services/boardingService";
import type { Passenger, CreatePassengerRequest, PassengerGender } from "../admin/features/passengers/types/passengerTypes";
import type { Reservation, ReservationStatus } from "../admin/features/reservations/types/reservationTypes";
import type { Country } from "../types/country";
import type { ApiErrorResponse } from "../types/ApiError";

type TabType = "reservations" | "profile";

// Check if check-in is allowed (24 hours to 1 hour before departure)
const isCheckInAllowed = (departureDateTimeStr: string, flightStatus: string) => {
  if (flightStatus === "CHECK_IN_AVAILABLE") return true;
  if (
    flightStatus === "BOARDING" ||
    flightStatus === "GATE_CLOSED" ||
    flightStatus === "COMPLETED" ||
    flightStatus === "CANCELED"
  ) {
    return false;
  }
  if (!departureDateTimeStr) return false;

  const now = new Date();
  const departure = new Date(departureDateTimeStr);
  const diffInHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);

  return diffInHours >= 1 && diffInHours <= 24;
};

// Cancellation is only allowed up to 24 hours before departure
const canCancelReservation = (res: Reservation): boolean => {
  if (res.status !== "RESERVED") return false;

  const departureDateTimeStr =
    res.flight.departureDateTime || res.flight.localDepartureDateTime;
  if (!departureDateTimeStr) return false;

  const now = new Date();
  const departure = new Date(departureDateTimeStr);
  const diffInHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);

  return diffInHours >= 24;
};

const hasAllPassengersCheckedIn = (res: Reservation): boolean =>
  res.passengers.length > 0 &&
  res.passengers.every(
    (p) => p.status === "CHECKED_IN" || p.status === "BOARDED",
  );

const getStatusBadge = (status: ReservationStatus) => {
  switch (status) {
    case "RESERVED":
      return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">RESERVADO</span>;
    case "COMPLETED":
      return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">COMPLETADO</span>;
    case "CANCELED":
      return <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-full">CANCELADO</span>;
    default:
      return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">{status}</span>;
  }
};

const getPassengerStatusBadge = (status: string) => {
  switch (status) {
    case "CHECKED_IN":
      return <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Checked-in</span>;
    case "BOARDED":
      return <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Abordado</span>;
    case "RESERVED":
      return <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pendiente Check-in</span>;
    case "CANCELED":
      return <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Cancelado</span>;
    default:
      return <span className="text-xs font-medium text-gray-600">{status}</span>;
  }
};

// ─── Profile reducer ───

interface ProfileState {
  profile: Passenger | null;
  hasProfile: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  isEditing: boolean;
}

const initialProfileState: ProfileState = {
  profile: null,
  hasProfile: false,
  loading: true,
  error: null,
  success: null,
  isEditing: false,
};

type ProfileAction =
  | { type: "PROFILE_LOAD_START" }
  | { type: "PROFILE_LOADED"; profile: Passenger }
  | { type: "PROFILE_NOT_FOUND" }
  | { type: "PROFILE_LOAD_ERROR" }
  | { type: "PROFILE_SAVE_START" }
  | { type: "PROFILE_SAVED"; profile: Passenger; message: string }
  | { type: "PROFILE_SAVE_ERROR"; message: string }
  | { type: "SET_EDITING"; value: boolean };

const profileReducer: Reducer<ProfileState, ProfileAction> = (state, action) => {
  switch (action.type) {
    case "PROFILE_LOAD_START":
      return { ...state, loading: true, error: null };
    case "PROFILE_LOADED":
      return { ...state, loading: false, profile: action.profile, hasProfile: true };
    case "PROFILE_NOT_FOUND":
      return { ...state, loading: false, hasProfile: false, profile: null };
    case "PROFILE_LOAD_ERROR":
      return { ...state, loading: false, error: "Error al cargar la información del perfil." };
    case "PROFILE_SAVE_START":
      return { ...state, loading: true, error: null, success: null };
    case "PROFILE_SAVED":
      return { ...state, loading: false, profile: action.profile, hasProfile: true, success: action.message, isEditing: false };
    case "PROFILE_SAVE_ERROR":
      return { ...state, loading: false, error: action.message };
    case "SET_EDITING":
      return { ...state, isEditing: action.value };
  }
};

// ─── Profile form reducer ───

type ProfileFormField =
  | "firstName"
  | "lastName"
  | "nationalityIsoCode"
  | "dateOfBirth"
  | "passportNumber"
  | "identificationNumber";

interface ProfileFormState {
  firstName: string;
  lastName: string;
  gender: PassengerGender;
  nationalityIsoCode: string;
  dateOfBirth: string;
  passportNumber: string;
  identificationNumber: string;
}

const initialProfileFormState: ProfileFormState = {
  firstName: "",
  lastName: "",
  gender: "M",
  nationalityIsoCode: "",
  dateOfBirth: "",
  passportNumber: "",
  identificationNumber: "",
};

type ProfileFormAction =
  | { type: "SET_FIELD"; field: ProfileFormField; value: string }
  | { type: "SET_GENDER"; value: PassengerGender }
  | { type: "POPULATE"; profile: Passenger };

const profileFormReducer: Reducer<ProfileFormState, ProfileFormAction> = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_GENDER":
      return { ...state, gender: action.value };
    case "POPULATE":
      return {
        firstName: action.profile.firstName || "",
        lastName: action.profile.lastName || "",
        gender: action.profile.gender || "M",
        nationalityIsoCode: action.profile.nationalityIsoCode || "",
        dateOfBirth: action.profile.dateOfBirth || "",
        passportNumber: action.profile.passportNumber || "",
        identificationNumber: action.profile.identificationNumber || "",
      };
  }
};

// ─── Reservations reducer ───

interface ReservationsState {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  statusFilter: ReservationStatus | "";
  page: number;
  totalPages: number;
}

const initialReservationsState: ReservationsState = {
  reservations: [],
  loading: true,
  error: null,
  statusFilter: "",
  page: 0,
  totalPages: 1,
};

type ReservationsAction =
  | { type: "LOAD_START" }
  | { type: "LOADED"; reservations: Reservation[]; totalPages: number }
  | { type: "LOAD_ERROR" }
  | { type: "SET_FILTER"; status: ReservationStatus | "" }
  | { type: "SET_PAGE"; page: number };

const reservationsReducer: Reducer<ReservationsState, ReservationsAction> = (state, action) => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOADED":
      return { ...state, loading: false, reservations: action.reservations, totalPages: action.totalPages };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: "No se pudieron cargar tus reservas." };
    case "SET_FILTER":
      return { ...state, statusFilter: action.status, page: 0 };
    case "SET_PAGE":
      return { ...state, page: action.page };
  }
};

// ─── Canceling reducer ───

interface CancelingState {
  cancelingNumber: string | null;
  cancelingPassengerId: string | null;
}

const initialCancelingState: CancelingState = {
  cancelingNumber: null,
  cancelingPassengerId: null,
};

type CancelingAction =
  | { type: "CANCEL_RESERVATION_START"; number: string }
  | { type: "CANCEL_PASSENGER_START"; key: string }
  | { type: "CANCEL_END" };

const cancelingReducer: Reducer<CancelingState, CancelingAction> = (state, action) => {
  switch (action.type) {
    case "CANCEL_RESERVATION_START":
      return { ...state, cancelingNumber: action.number };
    case "CANCEL_PASSENGER_START":
      return { ...state, cancelingPassengerId: action.key };
    case "CANCEL_END":
      return initialCancelingState;
  }
};

// ─── Views ───

const UserBanner = ({ userEmail, displayName }: { userEmail?: string; displayName: string }) => (
  <div className="bg-gradient-to-r from-[#0B1C2C] to-[#1e3a5f] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xl">
          {userEmail?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-slate-300 text-sm">{userEmail}</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-medium text-yellow-300">
      <span>Rol: Pasajero Cliente</span>
    </div>
  </div>
);

const TabNav = ({ activeTab, onChange }: { activeTab: TabType; onChange: (tab: TabType) => void }) => (
  <div className="flex border-b border-gray-200 bg-white rounded-xl p-1 shadow-sm">
    <button
      type="button"
      onClick={() => onChange("reservations")}
      className={`flex-1 py-3 text-center font-semibold text-sm rounded-lg transition inline-flex items-center justify-center gap-2 cursor-pointer ${
        activeTab === "reservations"
          ? "bg-[#0B1C2C] text-white shadow"
          : "text-gray-600 hover:text-black hover:bg-gray-50"
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      <span>Mis Reservas e Historial</span>
    </button>
    <button
      type="button"
      onClick={() => onChange("profile")}
      className={`flex-1 py-3 text-center font-semibold text-sm rounded-lg transition inline-flex items-center justify-center gap-2 cursor-pointer ${
        activeTab === "profile"
          ? "bg-[#0B1C2C] text-white shadow"
          : "text-gray-600 hover:text-black hover:bg-gray-50"
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>Mi Perfil de Pasajero</span>
    </button>
  </div>
);

interface ReservationsTabProps {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  statusFilter: ReservationStatus | "";
  page: number;
  totalPages: number;
  cancelingNumber: string | null;
  cancelingPassengerId: string | null;
  onFilterChange: (status: ReservationStatus | "") => void;
  onPageChange: (page: number) => void;
  onCancelReservation: (resNumber: string, email: string) => void;
  onCancelPassenger: (
    resNumber: string,
    contactEmail: string,
    identificationNumber: string,
    countryIsoCode: string,
    passengerName: string
  ) => void;
}

const ReservationsTab = ({
  reservations,
  loading,
  error,
  statusFilter,
  page,
  totalPages,
  cancelingNumber,
  cancelingPassengerId,
  onFilterChange,
  onPageChange,
  onCancelReservation,
  onCancelPassenger,
}: ReservationsTabProps) => (
  <div className="space-y-6">
    {/* Filter bar */}
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800">Historial de Vuelos y Reservas</h2>
      <div className="flex gap-2">
        {[
          { label: "Todas", value: "" },
          { label: "Reservadas", value: "RESERVED" },
          { label: "Completadas", value: "COMPLETED" },
          { label: "Canceladas", value: "CANCELED" },
        ].map((btn) => (
          <button
            type="button"
            key={btn.value}
            onClick={() => onFilterChange(btn.value as ReservationStatus | "")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              statusFilter === btn.value
                ? "bg-yellow-400 text-black shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>

    {/* List */}
    {loading ? (
      <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        Cargando reservas...
      </div>
    ) : error ? (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-center">
        {error}
      </div>
    ) : reservations.length === 0 ? (
      <div className="bg-white rounded-2xl p-12 text-center text-gray-500 shadow-sm border border-gray-100 space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800">No tienes reservas {statusFilter ? "con este estado" : "aún"}</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          ¿Buscas un viaje? Realiza una búsqueda de vuelos e inicia tu próxima aventura.
        </p>
        <Link
          to="/"
          className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-2.5 rounded-xl transition"
        >
          Buscar Vuelos
        </Link>
      </div>
    ) : (
      <div className="space-y-4">
        {reservations.map((res) => {
          const checkInOpen = isCheckInAllowed(
            res.flight.departureDateTime || res.flight.localDepartureDateTime,
            res.flight.status
          );
          const allCheckedIn = hasAllPassengersCheckedIn(res);
          const cancelAllowed = canCancelReservation(res);

          return (
            <div
              key={res.number}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 hover:shadow-md transition space-y-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg text-blue-950">
                    Reserva #{res.number}
                  </span>
                  {getStatusBadge(res.status)}
                </div>
                <span className="text-xs text-gray-400">
                  Reservado el: {new Date(res.reservationDatetime).toLocaleDateString("es-CO")}
                </span>
              </div>

              {/* Flight details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Vuelo</span>
                  <p className="font-bold text-gray-900">{res.flight.flightNumber}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ruta</span>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <span>{res.flight.origin}</span>
                    <svg className="w-4 h-4 text-slate-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span>{res.flight.destination}</span>
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Salida</span>
                  <p className="font-semibold text-gray-800 text-sm">
                    {new Date(res.flight.departureDateTime).toLocaleString("es-CO", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* Boarding note */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 italic">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>El abordaje comienza 40 minutos antes de la salida del vuelo.</span>
              </div>

              {/* Passengers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Pasajeros</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {res.passengers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {p.passenger.firstName} {p.passenger.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Asiento: <span className="font-bold text-blue-600">{p.seatLabel || "Sin asignar"}</span> ({p.seatClass === "FIRST_CLASS" ? "Primera Clase" : "Económica"})
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getPassengerStatusBadge(p.status)}

                        {/* Boarding pass download button if checked in */}
                        {(p.status === "CHECKED_IN" || p.status === "BOARDED") && (
                          <button
                            type="button"
                            onClick={() => downloadBoardingPass(p.id)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Pasabordo</span>
                          </button>
                        )}

                        {/* Individual passenger cancel button */}
                        {res.status === "RESERVED" && p.status === "RESERVED" && (
                          <button
                            type="button"
                            onClick={() =>
                              onCancelPassenger(
                                res.number,
                                res.contactEmail,
                                p.passenger.identificationNumber,
                                p.passenger.nationalityIsoCode,
                                `${p.passenger.firstName} ${p.passenger.lastName}`
                              )
                            }
                            disabled={cancelingPassengerId === `${res.number}-${p.passenger.identificationNumber}`}
                            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancelar este pasajero"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>
                              {cancelingPassengerId === `${res.number}-${p.passenger.identificationNumber}`
                                ? "Cancelando..."
                                : "Cancelar pasajero"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3 pt-2">
                {res.status === "RESERVED" && !allCheckedIn && (
                  <>
                    {checkInOpen ? (
                      <Link
                        to={`/check-in?reservation=${res.number}&email=${encodeURIComponent(res.contactEmail)}`}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold px-4 py-2 rounded-lg transition"
                      >
                        Ir a Check-in
                      </Link>
                    ) : (
                      <div className="flex flex-col items-end sm:items-start gap-1">
                        <button
                          type="button"
                          disabled
                          className="bg-gray-200 text-gray-400 text-xs font-bold px-4 py-2 rounded-lg cursor-not-allowed"
                          title="Check-in no disponible fuera del horario permitido"
                        >
                          Ir a Check-in
                        </button>
                        <span className="text-[11px] text-slate-500 font-medium italic">
                          * El check-in está disponible únicamente entre 24 y 1 hora antes de la salida del vuelo.
                        </span>
                      </div>
                    )}

                    {cancelAllowed && (
                      <button
                        type="button"
                        onClick={() => onCancelReservation(res.number, res.contactEmail)}
                        disabled={cancelingNumber === res.number}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                      >
                        {cancelingNumber === res.number ? "Cancelando..." : "Cancelar Reserva"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(Math.max(0, page - 1))}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-xs text-gray-600 font-medium">
              Página {page + 1} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);

const ProfileDetailsView = ({ profile }: { profile: Passenger | null }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
    <div>
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nombre Completo</span>
      <p className="font-bold text-gray-900 text-base">{profile?.firstName} {profile?.lastName}</p>
    </div>

    <div>
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Identificación</span>
      <p className="font-semibold text-gray-800">{profile?.identificationNumber}</p>
    </div>

    <div>
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">País de Emisión</span>
      <p className="font-semibold text-gray-800">{profile?.nationalityIsoCode}</p>
    </div>

    <div>
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pasaporte</span>
      <p className="font-semibold text-gray-800">{profile?.passportNumber || "No registrado"}</p>
    </div>

    <div>
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fecha de Nacimiento</span>
      <p className="font-semibold text-gray-800">{profile?.dateOfBirth}</p>
    </div>

    <div>
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Género</span>
      <p className="font-semibold text-gray-800">
        {profile?.gender === "M" ? "Masculino" : profile?.gender === "F" ? "Femenino" : "Otro"}
      </p>
    </div>
  </div>
);

interface ProfileFormProps {
  form: ProfileFormState;
  hasProfile: boolean;
  countries: Country[];
  loading: boolean;
  onFieldChange: (field: ProfileFormField, value: string) => void;
  onGenderChange: (value: PassengerGender) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfileForm = ({ form, hasProfile, countries, loading, onFieldChange, onGenderChange, onCancel, onSubmit }: ProfileFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="profile-firstName" className="block text-xs font-semibold text-gray-700 mb-1">Nombres *</label>
        <input
          type="text"
          id="profile-firstName"
          required
          value={form.firstName}
          onChange={(e) => onFieldChange("firstName", e.target.value)}
          placeholder="Ej: Juan Carlos"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div>
        <label htmlFor="profile-lastName" className="block text-xs font-semibold text-gray-700 mb-1">Apellidos *</label>
        <input
          type="text"
          id="profile-lastName"
          required
          value={form.lastName}
          onChange={(e) => onFieldChange("lastName", e.target.value)}
          placeholder="Ej: Pérez Gómez"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="profile-identificationNumber" className="block text-xs font-semibold text-gray-700 mb-1">Número de Identificación *</label>
        <input
          type="text"
          id="profile-identificationNumber"
          required
          value={form.identificationNumber}
          onChange={(e) => onFieldChange("identificationNumber", e.target.value)}
          placeholder="Ej: 1032456789"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div>
        <label htmlFor="profile-nationalityIsoCode" className="block text-xs font-semibold text-gray-700 mb-1">País de Emisión / Nacionalidad *</label>
        <select
          id="profile-nationalityIsoCode"
          required
          value={form.nationalityIsoCode}
          onChange={(e) => onFieldChange("nationalityIsoCode", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 bg-white"
        >
          <option value="">Seleccionar país</option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name} ({c.isoCode})
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label htmlFor="profile-passportNumber" className="block text-xs font-semibold text-gray-700 mb-1">Pasaporte (Opcional)</label>
        <input
          type="text"
          id="profile-passportNumber"
          value={form.passportNumber}
          onChange={(e) => onFieldChange("passportNumber", e.target.value)}
          placeholder="Ej: A1234567"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div>
        <label htmlFor="profile-dateOfBirth" className="block text-xs font-semibold text-gray-700 mb-1">Fecha de Nacimiento *</label>
        <input
          type="date"
          id="profile-dateOfBirth"
          required
          value={form.dateOfBirth}
          onChange={(e) => onFieldChange("dateOfBirth", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div>
        <label htmlFor="profile-gender" className="block text-xs font-semibold text-gray-700 mb-1">Género *</label>
        <select
          id="profile-gender"
          required
          value={form.gender}
          onChange={(e) => onGenderChange(e.target.value as PassengerGender)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 bg-white"
        >
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
          <option value="O">Otro</option>
        </select>
      </div>
    </div>

    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
      {hasProfile && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 cursor-pointer"
        >
          Cancelar
        </button>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl text-sm font-bold shadow transition cursor-pointer"
      >
        {loading ? "Guardando..." : hasProfile ? "Guardar Cambios" : "Crear Perfil"}
      </button>
    </div>
  </form>
);

interface ProfileTabProps {
  profile: Passenger | null;
  hasProfile: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  isEditing: boolean;
  countries: Country[];
  form: ProfileFormState;
  onToggleEditing: () => void;
  onFieldChange: (field: ProfileFormField, value: string) => void;
  onGenderChange: (value: PassengerGender) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfileTab = ({ profile, hasProfile, loading, error, success, isEditing, countries, form, onToggleEditing, onFieldChange, onGenderChange, onSubmit }: ProfileTabProps) => (
  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/80 max-w-3xl mx-auto space-y-6">
    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Perfil del Pasajero Principal</h2>
        <p className="text-xs text-gray-500 mt-1">
          Mantén tus datos actualizados para agilizar tus compras y check-in.
        </p>
      </div>

      {hasProfile && !isEditing && (
        <button
          type="button"
          onClick={onToggleEditing}
          className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Editar Perfil</span>
        </button>
      )}
    </div>

    {success && (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{success}</span>
      </div>
    )}

    {error && (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
        <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{error}</span>
      </div>
    )}

    {!hasProfile && !loading && (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Aún no has registrado tu perfil de pasajero. Completa los datos a continuación para vincular tu información personal a tu usuario.</span>
      </div>
    )}

    {loading ? (
      <div className="p-8 text-center text-gray-500">Cargando perfil...</div>
    ) : hasProfile && !isEditing ? (
      <ProfileDetailsView profile={profile} />
    ) : (
      <ProfileForm
        form={form}
        hasProfile={hasProfile}
        countries={countries}
        loading={loading}
        onFieldChange={onFieldChange}
        onGenderChange={onGenderChange}
        onCancel={() => onToggleEditing()}
        onSubmit={onSubmit}
      />
    )}
  </div>
);

export const UserProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("reservations");
  const [countries, setCountries] = useState<Country[]>([]);

  const [profile, profileDispatch] = useReducer(profileReducer, initialProfileState);
  const [form, formDispatch] = useReducer(profileFormReducer, initialProfileFormState);
  const [reservations, reservationsDispatch] = useReducer(reservationsReducer, initialReservationsState);
  const [canceling, cancelingDispatch] = useReducer(cancelingReducer, initialCancelingState);

  useEffect(() => {
    getAllCountries().then(setCountries).catch(() => {});
  }, []);

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      profileDispatch({ type: "PROFILE_LOAD_START" });
      const data = await getMyProfile();
      profileDispatch({ type: "PROFILE_LOADED", profile: data });
      formDispatch({ type: "POPULATE", profile: data });
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response?.status === 404) {
        profileDispatch({ type: "PROFILE_NOT_FOUND" });
      } else {
        profileDispatch({ type: "PROFILE_LOAD_ERROR" });
      }
    }
  };

  // Fetch Reservations
  const fetchReservations = async (status: ReservationStatus | "", currentPage: number) => {
    try {
      reservationsDispatch({ type: "LOAD_START" });
      const res = await getMyReservations(status, currentPage, 10);
      reservationsDispatch({ type: "LOADED", reservations: res.content, totalPages: res.totalPages || 1 });
    } catch {
      reservationsDispatch({ type: "LOAD_ERROR" });
    }
  };

  // Initial load of profile and reservations on mount
  // react-doctor-disable-next-line no-fetch-in-effect – initial data load on mount; a data-fetching layer is out of scope for this SPA
  useEffect(() => {
    fetchProfile();
    fetchReservations(reservations.statusFilter, reservations.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "reservations") {
      fetchReservations(reservations.statusFilter, reservations.page);
    }
  };

  const handleFilterChange = (status: ReservationStatus | "") => {
    reservationsDispatch({ type: "SET_FILTER", status });
    fetchReservations(status, 0);
  };

  const handlePageChange = (page: number) => {
    reservationsDispatch({ type: "SET_PAGE", page });
    fetchReservations(reservations.statusFilter, page);
  };

  // Submit Profile (Create or Update)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreatePassengerRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      nationalityIsoCode: form.nationalityIsoCode,
      dateOfBirth: form.dateOfBirth,
      passportNumber: form.passportNumber.trim() || undefined,
      identificationNumber: form.identificationNumber.trim(),
    };

    try {
      profileDispatch({ type: "PROFILE_SAVE_START" });
      if (profile.hasProfile) {
        const updated = await updateMyProfile(payload);
        profileDispatch({ type: "PROFILE_SAVED", profile: updated, message: "Perfil actualizado con éxito." });
      } else {
        const created = await createMyProfile(payload);
        profileDispatch({ type: "PROFILE_SAVED", profile: created, message: "Perfil de pasajero creado exitosamente." });
      }
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        profileDispatch({ type: "PROFILE_SAVE_ERROR", message: err.response?.data.message ?? "Error al guardar el perfil." });
      } else {
        profileDispatch({ type: "PROFILE_SAVE_ERROR", message: "Error inesperado al procesar la solicitud." });
      }
    }
  };

  // Cancel individual passenger from a reservation
  const handleCancelPassenger = async (
    resNumber: string,
    contactEmail: string,
    identificationNumber: string,
    countryIsoCode: string,
    passengerName: string
  ) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas cancelar la reserva del pasajero ${passengerName} en la reserva ${resNumber}?`
      )
    ) {
      return;
    }
    const key = `${resNumber}-${identificationNumber}`;
    try {
      cancelingDispatch({ type: "CANCEL_PASSENGER_START", key });
      await cancelMyPassengerReservation(resNumber, contactEmail, identificationNumber, countryIsoCode);
      fetchReservations(reservations.statusFilter, reservations.page);
    } catch {
      alert("No se pudo cancelar el pasajero. Verifica que la reserva esté activa.");
    } finally {
      cancelingDispatch({ type: "CANCEL_END" });
    }
  };

  // Cancel Reservation
  const handleCancelReservation = async (resNumber: string, email: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas cancelar la reserva ${resNumber}?`)) {
      return;
    }

    try {
      cancelingDispatch({ type: "CANCEL_RESERVATION_START", number: resNumber });
      await cancelMyReservation(resNumber, email);
      fetchReservations(reservations.statusFilter, reservations.page);
    } catch {
      alert("No se pudo cancelar la reserva.");
    } finally {
      cancelingDispatch({ type: "CANCEL_END" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <UserBanner
          userEmail={user?.email}
          displayName={profile.profile ? `${profile.profile.firstName} ${profile.profile.lastName}` : "Mi Cuenta"}
        />

        <TabNav
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        {activeTab === "reservations" && (
          <ReservationsTab
            reservations={reservations.reservations}
            loading={reservations.loading}
            error={reservations.error}
            statusFilter={reservations.statusFilter}
            page={reservations.page}
            totalPages={reservations.totalPages}
            cancelingNumber={canceling.cancelingNumber}
            cancelingPassengerId={canceling.cancelingPassengerId}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
            onCancelReservation={handleCancelReservation}
            onCancelPassenger={handleCancelPassenger}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            profile={profile.profile}
            hasProfile={profile.hasProfile}
            loading={profile.loading}
            error={profile.error}
            success={profile.success}
            isEditing={profile.isEditing}
            countries={countries}
            form={form}
            onToggleEditing={() => profileDispatch({ type: "SET_EDITING", value: !profile.isEditing })}
            onFieldChange={(field, value) => formDispatch({ type: "SET_FIELD", field, value })}
            onGenderChange={(value) => formDispatch({ type: "SET_GENDER", value })}
            onSubmit={handleProfileSubmit}
          />
        )}
      </div>
    </div>
  );
};
