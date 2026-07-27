import type { Passenger } from "../types/passengerTypes";

interface PassengerTableProps {
  passengers: Passenger[];
  onEdit: (passenger: Passenger) => void;
}

export const PassengerTable = ({ passengers, onEdit }: PassengerTableProps) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b text-gray-700">
          <tr>
            <th className="px-6 py-4 font-semibold">ID</th>
            <th className="px-6 py-4 font-semibold">Nombre Completo</th>
            <th className="px-6 py-4 font-semibold">Identificación</th>
            <th className="px-6 py-4 font-semibold">Pasaporte</th>
            <th className="px-6 py-4 font-semibold">Género</th>
            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {passengers.map((passenger) => (
            <tr
              key={passenger.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {passenger.id}
              </td>
              <td className="px-6 py-4">
                {passenger.firstName} {passenger.lastName}
              </td>
              <td className="px-6 py-4">{passenger.nationalityIsoCode}-{passenger.identificationNumber}</td>
              <td className="px-6 py-4">{passenger.passportNumber ?? "—"}</td>
              <td className="px-6 py-4">{passenger.gender}</td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(passenger)}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 border border-gray-200 text-sm font-medium"
                >
                  Ver / Editar
                </button>
              </td>
            </tr>
          ))}
          {passengers.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No se encontraron pasajeros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
