export type PassengerGender = "M" | "F" | "O";

export interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  gender: PassengerGender;
  nationalityIsoCode: string;
  dateOfBirth: string; // LocalDate → "YYYY-MM-DD"
  passportNumber: string;
  identificationNumber: string;
}

export interface CreatePassengerRequest {
  firstName: string;
  lastName: string;
  gender: PassengerGender;
  nationalityIsoCode: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  passportNumber?: string;
  identificationNumber: string;
}

export interface UpdatePassportRequest {
  passportNumber: string;
}

export type PassengerSearchMode =
  | "all"
  | "by-flight"
  | "by-passport"
  | "by-identification";
