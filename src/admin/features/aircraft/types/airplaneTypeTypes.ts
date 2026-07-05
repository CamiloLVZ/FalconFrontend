export type AirplaneTypeStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "RETIRED";

export interface AirplaneType {
  id: number;
  producer: string;
  model: string;
  economySeats: number;
  firstClassSeats: number;
  status: AirplaneTypeStatus;
}

export interface AirplaneTypeSummary {
  producer: string;
  model: string;
  economySeats: number;
  firstClassSeats: number;
}

export interface CreateAirplaneTypeRequest {
  producer: string;
  model: string;
  economySeats: number;
  firstClassSeats: number;
}

export interface UpdateAirplaneTypeCapacityRequest {
  economySeats?: number;
  firstClassSeats?: number;
}

export interface CorrectAirplaneTypeIdentityRequest {
  producer?: string;
  model?: string;
}
