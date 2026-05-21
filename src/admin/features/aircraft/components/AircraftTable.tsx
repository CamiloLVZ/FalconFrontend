import type {
  AircraftStatusAction,
  AircraftType,
} from "../../../../types/aircraftType";
import {
  ACTION_LABELS,
  STATUS_LABELS,
  AVAILABLE_ACTIONS,
  STATUS_STYLES,
} from "../constants/aircraft.constants";

interface AircraftsTableProps {
  aircrafts: AircraftType[];
  onStatusAction: (id: number, action: AircraftStatusAction) => void;
  onEditIdentity?: (aircraft: AircraftType) => void;
  onEditCapacity?: (aircraft: AircraftType) => void;
}

export const AircraftTable = ({
  aircrafts,
  onStatusAction: onAction,
  onEditIdentity,
  onEditCapacity,
}: AircraftsTableProps) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Producer
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Model
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Economy Seats
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            First Class Seats
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {aircrafts.map((aircraft) => (
          <tr key={aircraft.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {aircraft.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {aircraft.producer}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {aircraft.model}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {aircraft.economySeats}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {aircraft.firstClassSeats}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[aircraft.status]}`}
              >
                {STATUS_LABELS[aircraft.status]}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex space-x-2">
                {AVAILABLE_ACTIONS[aircraft.status].map((action) => (
                  <button
                    key={action}
                    className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                    onClick={() => onAction(aircraft.id, action)}
                  >
                    {ACTION_LABELS[action]}
                  </button>
                ))}
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                  onClick={() => onEditIdentity && onEditIdentity(aircraft)}
                >
                  Edit Identity
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                  onClick={() => onEditCapacity && onEditCapacity(aircraft)}
                >
                  Edit Capacity
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
