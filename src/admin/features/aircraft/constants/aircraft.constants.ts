import type {
  AircraftStatus,
  AircraftStatusAction,
} from "../types/aircraftTypes";

export const STATUS_STYLES: Record<AircraftStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
  RETIRED: "bg-red-100 text-red-800",
};

export const STATUS_LABELS: Record<AircraftStatus, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  RETIRED: "Retirado",
};

export const ACTION_LABELS: Record<AircraftStatusAction, string> = {
  ACTIVATE: "Activar",
  DEACTIVATE: "Desactivar",
  RETIRE: "Retirar",
};

export const AVAILABLE_ACTIONS: Record<AircraftStatus, AircraftStatusAction[]> =
  {
    DRAFT: ["ACTIVATE"],
    ACTIVE: ["DEACTIVATE"],
    INACTIVE: ["ACTIVATE", "RETIRE"],
    RETIRED: [],
  };

export const ACTION_TO_STATUS: Record<AircraftStatusAction, AircraftStatus> = {
  ACTIVATE: "ACTIVE",
  DEACTIVATE: "INACTIVE",
  RETIRE: "RETIRED",
};
