// Re-export from shared types and add admin-specific types
export type { Flight, FlightStatus, CreateFlightRequest, RescheduleFlightRequest, ChangeAirplaneTypeRequest } from "../../../../types/flight";

export interface ResponseFlightDto {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  localDepartureDateTime: string;
  durationMinutes: number;
  airplaneType: {
    producer: string;
    model: string;
    economySeats: number;
    firstClassSeats: number;
  } | null;
  status: string;
  basePriceEconomy: number;
  basePriceFirstClass: number;
}

export interface CreateFlightDto {
  routeFlightNumber: string;
  departureDateTime: string;
}
