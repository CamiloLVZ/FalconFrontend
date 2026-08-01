import type { ResponseFlightDto } from "../../flights/types/flightTypes";
import type { Passenger } from "../../passengers/types/passengerTypes";

export type ReservationStatus = "RESERVED" | "COMPLETED" | "CANCELED";
export type PassengerReservationStatus =
  | "RESERVED"
  | "CHECKED_IN"
  | "CANCELED"
  | "BOARDED"
  | "EXPIRED";

export type SeatClass = "FIRST_CLASS" | "ECONOMY";

export interface PassengerReservation {
  id: number;
  passenger: Passenger;
  seatNumber: number;
  seatClass: SeatClass;
  status: PassengerReservationStatus;
  seatLabel: string;
}

export interface ResponsePassengerReservationDto {
  id: number;
  passenger: Passenger;
  seatNumber: number;
  seatLabel: string;
  seatClass: SeatClass;
  status: PassengerReservationStatus;
}

export type CheckInResponse = PassengerReservation;

export interface ResponseReservationDto {
  id: number;
  number: string;
  contactEmail: string;
  reservationDatetime: string;
  status: ReservationStatus;
  flight: ResponseFlightDto;
  passengers: PassengerReservation[];
}

export interface Reservation {
  number: string;
  contactEmail: string;
  reservationDatetime: string; // Instant → ISO string
  status: ReservationStatus;
  flight: ResponseFlightDto;
  passengers: PassengerReservation[];
}
