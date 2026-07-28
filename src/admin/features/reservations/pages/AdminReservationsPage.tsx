import { useState, type FormEvent } from "react";
import axios from "axios";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { AdminDrawer } from "../../../components/AdminDrawer";
import type { ApiErrorResponse } from "../../../../types/ApiError";

import { ReservationTable } from "../components/ReservationTable";
import {
  getReservation,
  getReservationsByFlight,
  cancelReservation,
  cancelPassengerFromReservation,
} from "../services/reservationService";
import type { Reservation, PassengerReservation } from "../types/reservationTypes";

export const AdminReservationsPage = () => {
  const [flightId, setFlightId] = useState("");
  const [reservationNumberInput, setReservationNumberInput] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Cancel passenger state
  const [lastSearchType, setLastSearchType] = useState<"flight" | "number" | null>(null);


  const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return unknownError.response?.data.message ?? fallback;
    }
    return "Ha ocurrido un error inesperado.";
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!flightId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setActionError(null);
      const pagedResponse = await getReservationsByFlight(
        Number(flightId),
        0,
        10,
      );
      setReservations(pagedResponse.content);
      setSelectedReservation(null);
      setIsDrawerOpen(false);
      setLastSearchType("flight");
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setError("No se han podido cargar las reservas del vuelo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByReservationNumber = async (e: FormEvent) => {
    e.preventDefault();
    const reservationNumber = reservationNumberInput.trim();

    if (!reservationNumber) return;

    try {
      setLoading(true);
      setError(null);
      setActionError(null);
      const reservation = await getReservation(reservationNumber);
      setReservations([reservation]);
      setSelectedReservation(reservation);
      setIsDrawerOpen(true);
      setLastSearchType("number");
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setSelectedReservation(null);
      setIsDrawerOpen(false);
      setError("No se encontró ninguna reserva con ese número.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setActionError(null);
    setIsDrawerOpen(true);
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;

    if (
      !window.confirm(
        `¿Estás seguro de que deseas cancelar la reserva ${selectedReservation.number}?`,
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError(null);

      const updatedReservation = await cancelReservation(
        selectedReservation.number,
        selectedReservation.contactEmail,
      );

      setReservations((prev) =>
        prev.map((r) =>
          r.number === updatedReservation.number ? updatedReservation : r,
        ),
      );
      setActionError(null);
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "No se pudo cancelar la reserva."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPassenger = async (passenger: PassengerReservation) => {
    if (!selectedReservation) return;

    if (
      !window.confirm(
        `¿Estás seguro de que deseas cancelar el pasajero ${passenger.passenger.firstName} ${passenger.passenger.lastName} de la reserva ${selectedReservation.number}?`,
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError(null);

      const updatedReservation = await cancelPassengerFromReservation(
        selectedReservation.number,
        selectedReservation.contactEmail,
        passenger.passenger.identificationNumber,
        passenger.passenger.nationalityIsoCode,
      );

      setReservations((prev) =>
        prev.map((r) =>
          r.number === updatedReservation.number ? updatedReservation : r,
        ),
      );
      setActionError(null);
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "No se pudo cancelar el pasajero."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh: re-run last search
  const handleRefresh = () => {
    if (lastSearchType === "flight" && flightId.trim()) {
      handleSearch(new Event("submit") as unknown as React.FormEvent);
    } else if (lastSearchType === "number" && reservationNumberInput.trim()) {
      handleSearchByReservationNumber(
        new Event("submit") as unknown as React.FormEvent,
      );
    }
  };

  if (error) {
    return <ErrorScreen messageTitle="Error" message={error} />;
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Reservas</h1>
        {hasSearched && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Refrescar"
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label
                htmlFor="flightId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ID del Vuelo
              </label>
              <input
                type="text"
                id="flightId"
                value={flightId}
                onChange={(e) => setFlightId(e.target.value)}
                placeholder="Ej: 123"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !flightId.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Buscar Reservas
            </button>
          </form>

          <form
            onSubmit={handleSearchByReservationNumber}
            className="flex gap-4 items-end"
          >
            <div className="flex-1 max-w-xs">
              <label
                htmlFor="reservationNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Número de Reserva
              </label>
              <input
                type="text"
                id="reservationNumber"
                value={reservationNumberInput}
                onChange={(e) => setReservationNumberInput(e.target.value)}
                placeholder="Ej: RES-1001"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !reservationNumberInput.trim()}
              className="px-6 py-2 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-900 disabled:opacity-50"
            >
              Buscar Reserva
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : !hasSearched ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm text-gray-500">
            Ingresa un ID de vuelo o un número de reserva para consultar la
            información.
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm text-gray-500">
            No se encontraron reservas para el vuelo especificado.
          </div>
        ) : (
          <ReservationTable
            reservations={reservations}
            onEdit={handleEditClick}
          />
        )}
      </div>

      <AdminDrawer
        title={
          selectedReservation
            ? `Reserva: ${selectedReservation.number}`
            : "Reserva"
        }
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedReservation && (
          <div className="space-y-6">
            {actionError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-3">
                {actionError}
              </div>
            )}

            {/* Detalles de Reserva */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                Detalles Generales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">ID Vuelo</p>
                  <p className="text-gray-900">
                    {selectedReservation.flight.id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Email Contacto</p>
                  <p className="text-gray-900">
                    {selectedReservation.contactEmail}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Fecha de Reserva</p>
                  <p className="text-gray-900">
                    {new Date(
                      selectedReservation.reservationDatetime,
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Estado</p>
                  <p className="text-gray-900">{selectedReservation.status}</p>
                </div>
              </div>
            </div>

            {/* Detalles de Pasajeros */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                Pasajeros
              </h3>
              {selectedReservation.passengers.length === 0 ? (
                <p className="text-sm text-gray-500">No hay pasajeros.</p>
              ) : (
                <div className="space-y-3">
                  {selectedReservation.passengers.map((p, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {p.passenger.firstName} {p.passenger.lastName}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {p.passenger.nationalityIsoCode} {p.passenger.identificationNumber}{p.passenger.passportNumber ? ` | Pasaporte: ${p.passenger.passportNumber}` : ""} | Asiento: {p.seatLabel}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.status === "RESERVED"
                              ? "bg-green-100 text-green-800"
                              : p.status === "CHECKED_IN"
                                ? "bg-blue-100 text-blue-800"
                                : p.status === "BOARDED"
                                  ? "bg-purple-100 text-purple-800"
                                  : p.status === "CANCELED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.status !== "CANCELED" && (
                          <button
                            onClick={() => handleCancelPassenger(p)}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cancelar Reserva */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">
                Zona de Peligro
              </h3>
              <p className="text-xs text-red-600 mb-3">
                La cancelación de una reserva eliminará la asignación de asiento
                y no se puede deshacer.
              </p>
              <button
                onClick={handleCancelReservation}
                  disabled={
                    isSubmitting || selectedReservation.status === "CANCELED"
                  }
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Procesando..." : "Cancelar Reserva"}
              </button>
            </div>
          </div>
        )}
      </AdminDrawer>
    </section>
  );
};
