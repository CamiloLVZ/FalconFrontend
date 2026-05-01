export interface AirplaneType {
  producer: string;
  model: string;
  economySeats: number;
  firstClassSeats: number;
}

export interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  localDepartureDateTime: string;
  durationMinutes: number;
  airplaneType: AirplaneType;
  status: string;
}

export interface FlightResponse {
  data: Flight[];
  total: number;
  date: string;
}

export interface FlightSearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  status: string;
}
