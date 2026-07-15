import type { ResponseFlightDto } from "../types/flightTypes";

interface FlightTableProps {
  flights: ResponseFlightDto[];
  onEdit: (flight: ResponseFlightDto) => void;
}

export const FlightTable = ({ flights, onEdit }: FlightTableProps) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b text-gray-700">
          <tr>
            <th className="px-6 py-4 font-semibold">ID</th>
            <th className="px-6 py-4 font-semibold">Vuelo</th>
            <th className="px-6 py-4 font-semibold">Ruta</th>
            <th className="px-6 py-4 font-semibold">Salida (Local)</th>
            <th className="px-6 py-4 font-semibold">Avión</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {flights.map((flight) => (
            <tr key={flight.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">
                {flight.id}
              </td>
              <td className="px-6 py-4 font-medium text-gray-900">
                {flight.flightNumber}
              </td>
              <td className="px-6 py-4">
                {flight.origin} - {flight.destination}
              </td>
              <td className="px-6 py-4">
                {new Date(flight.localDepartureDateTime).toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short",
                  hour12: false,
                })}
              </td>
              <td className="px-6 py-4">
                {flight.airplaneType
                  ? `${flight.airplaneType.producer} ${flight.airplaneType.model}`
                  : "—"}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    flight.status === "SCHEDULED"
                      ? "bg-blue-100 text-blue-800"
                      : flight.status === "CANCELLED" ||
                          flight.status === "CANCELED"
                        ? "bg-red-100 text-red-800"
                        : flight.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {flight.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(flight)}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 border border-gray-200 text-sm font-medium"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
          {flights.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No hay vuelos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
