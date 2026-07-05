import type { Flight } from "../../flights/types/flightTypes";
import type { Passenger } from "../../passengers/types/passengerTypes";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";
export type PassengerReservationStatus =
  | "CONFIRMED"
  | "CHECKED_IN"
  | "BOARDED"
  | "CANCELLED";

export interface PassengerReservation {
  passenger: Passenger;
  seatNumber: number;
  status: PassengerReservationStatus;
}

export interface Reservation {
  number: string;
  contactEmail: string;
  reservationDatetime: string; // Instant → ISO string
  status: ReservationStatus;
  flight: Flight;
  passengers: PassengerReservation[];
}

export interface AddPassengerToReservationRequest {
  passenger: {
    firstName: string;
    lastName: string;
    gender: string;
    nationalityIsoCode: string;
    dateOfBirth: string;
    passportNumber?: string;
    identificationNumber: string;
  };
  seatNumber: number;
}

export interface CreateReservationRequest {
  idFlight: number;
  contactEmail: string;
  passengers: AddPassengerToReservationRequest[];
}
