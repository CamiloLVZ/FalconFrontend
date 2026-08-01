import { apiClient } from "../api/axios";
import type { PagedResponse } from "../types/pagedResponse";
import type { Reservation, ReservationStatus } from "../admin/features/reservations/types/reservationTypes";

export const getMyReservations = async (
  status?: ReservationStatus | "",
  page = 0,
  size = 10
): Promise<PagedResponse<Reservation>> => {
  const params: Record<string, unknown> = { page, size };
  if (status) {
    params.status = status;
  }
  const response = await apiClient.get<PagedResponse<Reservation>>("/v1/reservations/me", { params });
  return response.data;
};

export const cancelMyReservation = async (
  reservationNumber: string,
  contactEmail: string
): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/cancel`,
    { contactEmail }
  );
  return response.data;
};

export const cancelMyPassengerReservation = async (
  reservationNumber: string,
  contactEmail: string,
  identificationNumber: string,
  countryIsoCode: string
): Promise<Reservation> => {
  const response = await apiClient.patch<Reservation>(
    `/v1/reservations/${reservationNumber}/cancel/passenger`,
    { contactEmail },
    { params: { identificationNumber, countryIsoCode } }
  );
  return response.data;
};
