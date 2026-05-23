import type {
  AircraftStatusAction,
  AircraftType,
} from "../types/aircraftType";
import { AircraftRowActions } from "./AircraftRowActions";
import { AircraftStatusBadge } from "./AircraftStatusBadge";

interface AircraftsTableProps {
  aircrafts: AircraftType[];
  onStatusAction: (id: number, action: AircraftStatusAction) => void;
  onEditIdentity?: (aircraft: AircraftType) => void;
  onEditCapacity?: (aircraft: AircraftType) => void;
}

export const AircraftTable = ({
  aircrafts,
  onStatusAction,
  onEditIdentity,
  onEditCapacity,
}: AircraftsTableProps) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Fabricante
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Modelo
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Asientos económica
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Asientos primera clase
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Estado
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {aircrafts.map((aircraft) => (
          <tr key={aircraft.id} className="hover:bg-gray-50">
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
              {aircraft.id}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {aircraft.producer}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {aircraft.model}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {aircraft.economySeats}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {aircraft.firstClassSeats}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
              <AircraftStatusBadge status={aircraft.status} />
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
              <AircraftRowActions
                aircraft={aircraft}
                onStatusAction={onStatusAction}
                onEditIdentity={onEditIdentity}
                onEditCapacity={onEditCapacity}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
