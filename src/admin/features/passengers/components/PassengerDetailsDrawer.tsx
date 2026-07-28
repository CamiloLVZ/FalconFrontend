import { useState, useEffect } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import type { Passenger } from "../types/passengerTypes";
import type { Reservation } from "../../reservations/types/reservationTypes";
import { getPassengerReservations, updatePassengerPassport } from "../services/passengerService";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface PassengerDetailsDrawerProps {
  passenger: Passenger;
}

export const PassengerDetailsDrawer = ({ passenger }: PassengerDetailsDrawerProps) => {
  const [passportNumber, setPassportNumber] = useState(passenger.passportNumber ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    setReservationsLoading(true);
    getPassengerReservations(
      passenger.identificationNumber,
      passenger.nationalityIsoCode,
      0,
      3,
    ).then((data) => {
      if (ignore) return;
      const sorted = data.content.toSorted(
        (a, b) =>
          new Date(a.flight.departureDateTime).getTime() -
          new Date(b.flight.departureDateTime).getTime(),
      );
      setUpcomingReservations(sorted.slice(0, 3));
    }).catch(() => {
      if (!ignore) setUpcomingReservations([]);
    }).finally(() => {
      setReservationsLoading(false);
    });
    return () => { ignore = true; };
  }, [passenger.identificationNumber, passenger.nationalityIsoCode]);

  const handleUpdatePassport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setActionError(null);
      await updatePassengerPassport(
        passenger.identificationNumber,
        passenger.nationalityIsoCode,
        passportNumber,
      );
      setActionError(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo actualizar el pasaporte."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Detalles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium">Nombre Completo</p>
            <p className="text-gray-900">{passenger.firstName} {passenger.lastName}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">ID de Pasajero</p>
            <p className="text-gray-900">{passenger.id}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Identificación</p>
            <p className="text-gray-900">{passenger.identificationNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Nacionalidad</p>
            <p className="text-gray-900">{passenger.nationalityIsoCode}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Fecha de Nacimiento</p>
            <p className="text-gray-900">{passenger.dateOfBirth}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Género</p>
            <p className="text-gray-900">{passenger.gender}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Próximas Reservas</h3>
        {reservationsLoading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : upcomingReservations.length === 0 ? (
          <p className="text-sm text-gray-500">No se encontraron reservas próximas.</p>
        ) : (
          <div className="space-y-3">
            {upcomingReservations.map((r) => (
              <div key={r.number} className="text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{r.flight.flightNumber}</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.status === "RESERVED"
                      ? "bg-green-100 text-green-800"
                      : r.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                  }`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {r.flight.origin} → {r.flight.destination} |{" "}
                  {new Date(r.flight.departureDateTime).toLocaleDateString()}{" "}
                  {new Date(r.flight.departureDateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-gray-400">
                  Reserva: {r.number} | {r.passengers.length} pasajero(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleUpdatePassport} className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">Actualizar Pasaporte</h3>
        {actionError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-3">{actionError}</div>
        )}
        <div className="space-y-3">
          <input
            type="text"
            aria-label="Número de Pasaporte"
            placeholder="Número de Pasaporte"
            value={passportNumber}
            onChange={(e) => setPassportNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || passportNumber === passenger.passportNumber}
            className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Actualizando..." : "Guardar Pasaporte"}
          </button>
        </div>
      </form>
    </div>
  );
};
