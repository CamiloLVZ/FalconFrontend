import { apiClient } from "../../../../api/axios";
import type {
  Reservation,
  CreateReservationRequest,
} from "../types/reservationTypes";

export const getReservation = async (reservationNumber: string): Promise<Reservation> => {
  const response = await apiClient.get<Reservation>(`/v1/reservations/${reservationNumber}`);
  return response.data;
};

export const getReservationsByFlight = async (flightId: number): Promise<Reservation[]> => {
  const response = await apiClient.get<Reservation[]>(`/v1/reservations/flight/${flightId}`);
  return response.data;
};

export const createReservation = async (
  data: CreateReservationRequest,
): Promise<Reservation> => {
  const response = await apiClient.post<Reservation>("/v1/reservations", data);
  return response.data;
};

export const cancelReservation = async (reservationNumber: string): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/cancel`,
  );
  return response.data;
};

export const cancelPassengerFromReservation = async (
  reservationNumber: string,
): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/cancel/passenger`,
  );
  return response.data;
};

export const cancelPassengerFromReservationByPassport = async (
  reservationNumber: string,
  passportNumber: string,
): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/cancel/passenger/${passportNumber}`,
  );
  return response.data;
};

export const checkInReservation = async (reservationNumber: string): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/check-in`,
  );
  return response.data;
};

export const boardReservation = async (reservationNumber: string): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/board`,
  );
  return response.data;
};
