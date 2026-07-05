import type { AirplaneTypeSummary } from "../admin/features/aircraft/types/airplaneTypeTypes";

export type FlightStatus =
  | "SCHEDULED"
  | "CHECK_IN_AVAILABLE"
  | "BOARDING"
  | "COMPLETED"
  | "CANCELED"
  | "CANCELLED"
  | "DELAYED";

export interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDateTime: string; // OffsetDateTime → ISO 8601 string
  localDepartureDateTime: string; // LocalDateTime → ISO string
  durationMinutes: number;
  airplaneType: AirplaneTypeSummary;
  status: FlightStatus;
}

export interface FlightSearchResult {
  data: Flight[];
  total: number;
  date: string; // LocalDate → "YYYY-MM-DD"
}

export interface CreateFlightRequest {
  routeFlightNumber: string;
  departureDateTime: string; // "YYYY-MM-DDTHH:mm:ss"
}

export interface RescheduleFlightRequest {
  departureDateTime: string; // "YYYY-MM-DDTHH:mm:ss"
}

export interface ChangeAirplaneTypeRequest {
  idAirplaneType: number;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  date: string;
  status?: string;
}

export type CleanFilters = Partial<FlightSearchParams>;

/** Alias for backward compatibility */
export type FlightResponse = FlightSearchResult;
