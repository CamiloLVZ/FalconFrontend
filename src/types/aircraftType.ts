export interface AircraftType {
  id: number;
  producer: string;
  model: string;
  economySeats: number;
  firstClassSeats: number;
  status: AircraftStatus;
}

export interface CreateAircraftDTO {
  producer: string;
  model: string;
  economySeats: number;
  firstClassSeats: number;
}

export interface CorrectIdentityAircraftDTO {
  producer: string;
  model: string;
}

export interface UpdateAircraftCapacityDTO {
  economySeats: number;
  firstClassSeats: number;
}

export type AircraftStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "RETIRED";
export type AircraftStatusAction = "ACTIVATE" | "DEACTIVATE" | "RETIRE";
