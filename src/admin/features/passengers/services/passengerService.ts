import { apiClient } from "../../../../api/axios";
import type { Passenger, CreatePassengerRequest, UpdatePassportRequest } from "../types/passengerTypes";
import type { Reservation } from "../../reservations/types/reservationTypes";

export const getPassengerById = async (id: number): Promise<Passenger> => {
  const response = await apiClient.get<Passenger>(`/v1/passengers/${id}`);
  return response.data;
};

export const getPassengerIdentification = async (): Promise<Passenger> => {
  const response = await apiClient.get<Passenger>("/v1/passengers/identification");
  return response.data;
};

export const getPassengerByPassport = async (passportNumber: string): Promise<Passenger> => {
  const response = await apiClient.get<Passenger>(`/v1/passengers/passport/${passportNumber}`);
  return response.data;
};

export const getPassengerReservations = async (): Promise<Reservation[]> => {
  // Returns reservations for the authenticated passenger
  const response = await apiClient.get<Reservation[]>("/v1/passengers/reservations");
  return response.data;
};

export const createPassenger = async (data: CreatePassengerRequest): Promise<Passenger> => {
  const response = await apiClient.post<Passenger>("/v1/passengers", data);
  return response.data;
};

export const updatePassengerPassport = async (
  data: UpdatePassportRequest,
): Promise<Passenger> => {
  const response = await apiClient.patch<Passenger>("/v1/passengers/passport", data);
  return response.data;
};
