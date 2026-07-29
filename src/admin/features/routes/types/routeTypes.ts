import type { AirplaneType } from "../../aircraft/types/airplaneTypeTypes";
import type { Airport } from "../../airports/types/airportTypes";

// ─── Enums ──────────────────────────────────────────────────────
export type RouteStatus = "ACTIVE" | "INACTIVE" | "DRAFT";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type LocalTime = string; // "HH:mm:ss"

// ─── Response ───────────────────────────────────────────────────

/** ResponseRouteDto */
export interface Route {
  flightNumber: string;
  airportOrigin: Airport;
  airportDestination: Airport;
  defaultAirplaneType: AirplaneType;
  durationMinutes: number;
  // Optional schedule augmentation applied locally when schedules are fetched
  daysOfWeek?: DayOfWeek[];
  schedules?: LocalTime[];
  // Backwards-compatible alias used in some API responses
  lengthMinutes?: number;
  status: RouteStatus;
  basePriceEconomy: number;
  basePriceFirstClass: number;
}

/** Route enriched with schedule data (not from backend ResponseRouteDto — local join) */
export interface RouteWithSchedules {
  flightNumber: string;
  daysOfWeek: DayOfWeek[];
  schedules: LocalTime[];
}

/** RouteWithSchedulesDto — returned by schedule endpoints */
export interface RouteSchedule {
  flightNumber: string;
  daysOfWeek: DayOfWeek[];
  schedules: LocalTime[];
}

// ─── Requests ────────────────────────────────────────────────────

/** CreateRouteDto */
export interface CreateRouteRequest {
  flightNumber: string;
  airportOriginIataCode: string;
  airportDestinationIataCode: string;
  idDefaultAirplaneType: number;
  durationMinutes: number;
  basePriceEconomy: number;
  basePriceFirstClass: number;
}

/** UpdateRouteDto */
export interface UpdateRouteRequest {
  airportOriginIataCode?: string;
  airportDestinationIataCode?: string;
  idDefaultAirplaneType?: number;
  durationMinutes?: number;
  basePriceEconomy?: number;
  basePriceFirstClass?: number;
}

/** AddRouteScheduleRequestDto */
export interface SetRouteScheduleRequest {
  daysOfWeek: DayOfWeek[];
  schedules: LocalTime[];
}

// ─── Backward-compat aliases (used in existing components) ────────
/** @deprecated Use Route instead */
export type ResponseRoute = Route;

/** @deprecated Use SetRouteScheduleRequest instead */
export type AddRouteScheduleRequest = SetRouteScheduleRequest;

export type RouteStatusAction = "ACTIVATE" | "DEACTIVATE";
