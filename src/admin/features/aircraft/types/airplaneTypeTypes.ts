export type AirplaneTypeStatus = "ACTIVE" | "INACTIVE" | "RETIRED";

export type AircraftStatusAction = "ACTIVATE" | "DEACTIVATE" | "RETIRE";

export interface AirplaneType {
  id: number;
  producer: string;
  model: string;
  economySeats: number;
  firstClassSeats: number;
  seatColumns: string;
  status: AirplaneTypeStatus;
}

export interface AirplaneTypeSummary {
  producer: string;
  model: string;
  economySeats: number;
  firstClassSeats: number;
  seatColumns: string;
}

export interface CreateAirplaneTypeRequest {
  producer: string;
  model: string;
  economySeats: number;
  firstClassSeats: number;
  seatColumns: string;
}

export interface ConfigureSeatsRequest {
  economySeats?: number;
  firstClassSeats?: number;
  seatColumns: string;
}

export interface CorrectAirplaneTypeIdentityRequest {
  producer?: string;
  model?: string;
}
