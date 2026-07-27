import { apiClient } from "../../../../api/axios";
import type { PagedResponse } from "../../../../types/pagedResponse";
import type { Reservation } from "../types/reservationTypes";

export const getReservation = async (
  reservationNumber: string,
  contactEmail?: string,
): Promise<Reservation> => {
  const response = await apiClient.get<Reservation>(
    `/v1/reservations/${reservationNumber}`,
    { params: contactEmail ? { contactEmail } : undefined },
  );
  return response.data;
};

export const getReservationsByFlight = async (
  flightId: number,
  page = 0,
  size = 10,
): Promise<PagedResponse<Reservation>> => {
  const response = await apiClient.get<
    PagedResponse<Reservation>
  >(`/v1/reservations/flight/${flightId}`, { params: { page, size } });

  return response.data;
};

export const cancelReservation = async (
  reservationNumber: string,
  contactEmail: string,
): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/cancel`,
    { contactEmail },
  );
  return response.data;
};

export const cancelPassengerFromReservation = async (
  reservationNumber: string,
  contactEmail: string,
  identificationNumber: string,
  countryIsoCode: string,
): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/cancel/passenger`,
    { contactEmail },
    { params: { identificationNumber, countryIsoCode } },
  );
  return response.data;
};

export const cancelPassengerFromReservationByPassport = async (
  reservationNumber: string,
  passportNumber: string,
  contactEmail: string,
): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/cancel/passenger/${passportNumber}`,
    { contactEmail },
  );
  return response.data;
};

export const checkInPassenger = async (
  reservationNumber: string,
  contactEmail: string,
  identificationNumber: string,
  countryIsoCode: string,
  seatNumber?: number,
): Promise<Reservation> => {
  const response = await apiClient.post<Reservation>(
    "/v1/check-in",
    {
      reservationNumber,
      contactEmail,
      identificationNumber,
      countryIsoCode,
      seatNumber,
    },
  );
  return response.data;
};
