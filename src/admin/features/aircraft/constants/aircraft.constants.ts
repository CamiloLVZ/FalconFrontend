import type {
  AirplaneTypeStatus,
  AircraftStatusAction,
} from "../types/airplaneTypeTypes";

export const STATUS_STYLES: Record<AirplaneTypeStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
  RETIRED: "bg-red-100 text-red-800",
};

export const STATUS_LABELS: Record<AirplaneTypeStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  RETIRED: "Retirado",
};

export const ACTION_LABELS: Record<AircraftStatusAction, string> = {
  ACTIVATE: "Activar",
  DEACTIVATE: "Desactivar",
  RETIRE: "Retirar",
};

export const AVAILABLE_ACTIONS: Record<
  AirplaneTypeStatus,
  AircraftStatusAction[]
> = {
  ACTIVE: ["DEACTIVATE"],
  INACTIVE: ["ACTIVATE", "RETIRE"],
  RETIRED: [],
};

export const ACTION_TO_STATUS: Record<
  AircraftStatusAction,
  AirplaneTypeStatus
> = {
  ACTIVATE: "ACTIVE",
  DEACTIVATE: "INACTIVE",
  RETIRE: "RETIRED",
};

export const SEAT_COLUMN_OPTIONS = ["ABCD", "ABCDEF", "ABCDEFGHI"];
