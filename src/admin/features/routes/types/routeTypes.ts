import type { AircraftType } from "../../aircraft/types/aircraftType";
import type { Airport } from "../../airports/types/AirportTypes";

export type RouteStatus = "ACTIVE" | "INACTIVE" | "DRAFT";
export type RouteStatusAction = "ACTIVATE" | "DEACTIVATE";

export interface ResponseRoute {
  flightNumber: string;
  airportOrigin: Airport;
  airportDestination: Airport;
  defaultAirplaneType: AircraftType;
  durationMinutes: number;
  status: RouteStatus;
  daysOfWeek?: DayOfWeek[];
  schedules?: LocalTime[];
}

export interface CreateRouteRequest {
  flightNumber: string;
  airportOriginIataCode: string;
  airportDestinationIataCode: string;
  idDefaultAirplaneType: number;
  durationMinutes: number;
}

export interface UpdateRouteRequest {
  airportOriginIataCode: string;
  airportDestinationIataCode: string;
  idDefaultAirplaneType: number;
  durationMinutes: number;
}

export interface RouteWithSchedules {
  flightNumber: string;
  daysOfWeek: DayOfWeek[];
  schedules: LocalTime[];
}
export interface AddRouteScheduleRequest {
  daysOfWeek: DayOfWeek[];
  schedules: LocalTime[];
}

export type LocalTime = string;

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
