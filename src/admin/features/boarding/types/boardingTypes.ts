import type { Reservation } from "../../reservations/types/reservationTypes";

export type BoardingPassStatus = "ISSUED" | "BOARDED" | "EXPIRED";
export type SeatClass = "FIRST_CLASS" | "ECONOMY";

export interface BoardingPassValidationResponse {
  qrToken: string;
  passengerName: string;
  identification: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  seatClass: SeatClass;
  seatNumber: number;
  seatLabel: string;
  status: BoardingPassStatus;
}

export interface BoardPassengerResponse {
  message: string;
  reservation?: Reservation;
}
