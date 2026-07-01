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
  onEditCapacity?: (aircraft: AircraftType) => void;
  onEditIdentity?: (aircraft: AircraftType) => void;
  onStatusAction: (id: number, action: AircraftStatusAction) => void;
}

export const AircraftRowActions = ({
  aircraft,
  onEditCapacity,
  onEditIdentity,
  onStatusAction,
}: AircraftRowActionsProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (value === "EDIT_IDENTITY") {
      onEditIdentity?.(aircraft);
    } else if (value === "EDIT_CAPACITY") {
      onEditCapacity?.(aircraft);
    } else if (value) {
      onStatusAction(aircraft.id, value as AircraftStatusAction);
    }

    event.target.value = "";
  };

  return (
    <select
      aria-label={`Acciones para aeronave ${aircraft.id}`}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      defaultValue=""
      onChange={handleChange}
    >
      <option value="" disabled>
        Acciones
      </option>
      <optgroup label="Editar">
        <option value="EDIT_IDENTITY">Editar identidad</option>
        <option value="EDIT_CAPACITY">Editar capacidad</option>
      </optgroup>
      {AVAILABLE_ACTIONS[aircraft.status].length > 0 ? (
        <optgroup label="Estado">
          {AVAILABLE_ACTIONS[aircraft.status].map((action) => (
            <option key={action} value={action}>
              {ACTION_LABELS[action]}
            </option>
          ))}
        </optgroup>
      ) : null}
    </select>
  );
};
