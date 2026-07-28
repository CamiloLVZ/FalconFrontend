import { AdminDrawer } from "../../../components/AdminDrawer";
import type { Reservation, PassengerReservation } from "../types/reservationTypes";

interface ReservationDetailDrawerProps {
  selectedReservation: Reservation | null;
  isSubmitting: boolean;
  actionError: string | null;
  isDrawerOpen: boolean;
  onClose: () => void;
  onCancelReservation: () => void;
  onCancelPassenger: (passenger: PassengerReservation) => void;
}

export const ReservationDetailDrawer = ({
  selectedReservation,
  isSubmitting,
  actionError,
  isDrawerOpen,
  onClose,
  onCancelReservation,
  onCancelPassenger,
}: ReservationDetailDrawerProps) => {
  return (
    <AdminDrawer
      title={
        selectedReservation
          ? `Reserva: ${selectedReservation.number}`
          : "Reserva"
      }
      isOpen={isDrawerOpen}
      onClose={onClose}
    >
      {selectedReservation && (
        <div className="space-y-6">
          {actionError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-3">
              {actionError}
            </div>
          )}

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
                          type="button"
                          onClick={() => onCancelPassenger(p)}
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

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">
              Zona de Peligro
            </h3>
            <p className="text-xs text-red-600 mb-3">
              La cancelación de una reserva eliminará la asignación de asiento
              y no se puede deshacer.
            </p>
            <button
              type="button"
              onClick={onCancelReservation}
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
  );
};
