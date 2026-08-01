export type SeatClass = "ECONOMY" | "FIRST_CLASS";

export type PaymentStatus = "APPROVED" | "REJECTED";

export interface FlightQuote {
  flightId: number;
  priceEconomy: number;
  priceFirstClass: number;
}

export interface BookingPassenger {
  clientId: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F" | "O" | "";
  dateOfBirth: string;
  identificationNumber: string;
  nationalityIsoCode: string;
  passportNumber: string;
  seatClass: SeatClass;
}

export interface PaymentPassengerDto {
  passenger: {
    firstName: string;
    lastName: string;
    gender?: string;
    dateOfBirth: string;
    identificationNumber: string;
    nationalityIsoCode: string;
    passportNumber?: string;
  };
  seatClass: SeatClass;
}

export interface PaymentRequestDto {
  flightId: number;
  contactEmail: string;
  passengers: PaymentPassengerDto[];
}

export interface PaymentResponse {
  reservationNumber: string;
  totalAmount: number;
  status: PaymentStatus;
  processedAt: string;
}
