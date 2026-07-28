import type { Reservation } from "../types/reservationTypes";

interface ReservationTableProps {
  reservations: Reservation[];
  onEdit: (reservation: Reservation) => void;
}

export const ReservationTable = ({ reservations, onEdit }: ReservationTableProps) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b text-gray-700">
          <tr>
            <th className="px-6 py-4 font-semibold">Código</th>
            <th className="px-6 py-4 font-semibold">Vuelo</th>
            <th className="px-6 py-4 font-semibold">Email Contacto</th>
            <th className="px-6 py-4 font-semibold">Pasajeros</th>
            <th className="px-6 py-4 font-semibold">Fecha</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {reservations.map((reservation) => (
            <tr key={reservation.number} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{reservation.number}</td>
              <td className="px-6 py-4">{reservation.flight.flightNumber}</td>
              <td className="px-6 py-4">{reservation.contactEmail}</td>
              <td className="px-6 py-4">{reservation.passengers.length}</td>
              <td className="px-6 py-4">{new Date(reservation.reservationDatetime).toLocaleString()}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    reservation.status === "RESERVED"
                      ? "bg-green-100 text-green-800"
                      : reservation.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {reservation.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(reservation)}
                  className="px-4 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 font-medium cursor-pointer transition-colors"
                >
                  Gestión
                </button>
              </td>
            </tr>
          ))}
          {reservations.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No hay reservas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
