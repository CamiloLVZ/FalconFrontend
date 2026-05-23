import {
  STATUS_LABELS,
  STATUS_STYLES,
} from "../constants/aircraft.constants";
import type { AircraftStatus } from "../types/aircraftType";

interface AircraftStatusBadgeProps {
  status: AircraftStatus;
}

export const AircraftStatusBadge = ({ status }: AircraftStatusBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
};
