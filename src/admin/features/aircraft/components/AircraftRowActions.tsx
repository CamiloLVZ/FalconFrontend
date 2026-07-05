import type { ChangeEvent } from "react";
import {
  ACTION_LABELS,
  AVAILABLE_ACTIONS,
} from "../constants/aircraft.constants";
import type {
  AircraftStatusAction,
  AircraftType,
} from "../types/aircraftTypes";

interface AircraftRowActionsProps {
  aircraft: AircraftType;
  onEdit?: (aircraft: AircraftType) => void;
  onStatusAction: (id: number, action: AircraftStatusAction) => void;
}

export const AircraftRowActions = ({
  aircraft,
  onEdit,
  onStatusAction,
}: AircraftRowActionsProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (value && value.startsWith("EDIT_")) {
      onEdit?.(aircraft);
    } else if (value) {
      onStatusAction(aircraft.id, value as AircraftStatusAction);
    }

    event.target.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(aircraft)}
        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 border border-gray-200 text-sm font-medium"
      >
        Editar
      </button>

      {AVAILABLE_ACTIONS[aircraft.status].length > 0 && (
        <select
          aria-label={`Acciones para aeronave ${aircraft.id}`}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          defaultValue=""
          onChange={handleChange}
        >
          <option value="" disabled>
            Estado
          </option>
          {AVAILABLE_ACTIONS[aircraft.status].map((action) => (
            <option key={action} value={action}>
              {ACTION_LABELS[action]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
