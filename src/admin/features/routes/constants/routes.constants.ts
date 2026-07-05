import type { DayOfWeek, RouteStatus, RouteStatusAction } from "../types/routeTypes";

export const STATUS_STYLES: Record<RouteStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
};

export const STATUS_LABELS: Record<RouteStatus, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  INACTIVE: "Inactiva",
};

export const ACTION_LABELS: Record<RouteStatusAction, string> = {
  ACTIVATE: "Activar",
  DEACTIVATE: "Desactivar",
};

export const AVAILABLE_ACTIONS: Record<
  RouteStatus,
  RouteStatusAction[]
> = {
  DRAFT: ["ACTIVATE"],
  ACTIVE: ["DEACTIVATE"],
  INACTIVE: ["ACTIVATE"],
};

export const ACTION_TO_STATUS: Record<
  RouteStatusAction,
  RouteStatus
> = {
  ACTIVATE: "ACTIVE",
  DEACTIVATE: "INACTIVE",
};

export const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Lun",
  TUESDAY: "Mar",
  WEDNESDAY: "Mié",
  THURSDAY: "Jue",
  FRIDAY: "Vie",
  SATURDAY: "Sáb",
  SUNDAY: "Dom",
};
