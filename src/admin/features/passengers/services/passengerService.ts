import { apiClient } from "../../../../api/axios";
import type {
  Passenger,
  CreatePassengerRequest,
} from "../types/passengerTypes";
import type { PagedResponse } from "../../../../types/pagedResponse";
import type { Reservation } from "../../reservations/types/reservationTypes";

export const getAllPassengers = async (
  page = 0,
  size = 10,
): Promise<PagedResponse<Passenger>> => {
  const response = await apiClient.get<PagedResponse<Passenger>>(
    "/v1/passengers",
    { params: { page, size } },
  );
  return response.data;
};

export const getPassengersByFlight = async (
  flightId: number,
  page = 0,
  size = 10,
): Promise<PagedResponse<Passenger>> => {
  const response = await apiClient.get<PagedResponse<Passenger>>(
    `/v1/passengers/flight/${flightId}`,
    { params: { page, size } },
  );
  return response.data;
};

export const getPassengerById = async (id: number): Promise<Passenger> => {
  const response = await apiClient.get<Passenger>(`/v1/passengers/${id}`);
  return response.data;
};

export const getPassengerByIdentification = async (
  identificationNumber: string,
  countryIsoCode: string,
): Promise<Passenger> => {
  const response = await apiClient.get<Passenger>(
    "/v1/passengers/identification",
    { params: { identificationNumber, countryIsoCode } },
  );
  return response.data;
};

export const getPassengerByPassport = async (
  passportNumber: string,
): Promise<Passenger> => {
  const response = await apiClient.get<Passenger>(
    `/v1/passengers/passport/${passportNumber}`,
  );
  return response.data;
};

export const getPassengerReservations = async (
  identificationNumber: string,
  countryIsoCode: string,
  page = 0,
  size = 10,
): Promise<PagedResponse<Reservation>> => {
  const response = await apiClient.get<PagedResponse<Reservation>>(
    "/v1/passengers/reservations",
    { params: { identificationNumber, countryIsoCode, page, size } },
  );
  return response.data;
};

export const createPassenger = async (
  data: CreatePassengerRequest,
): Promise<Passenger> => {
  const response = await apiClient.post<Passenger>("/v1/passengers", data);
  return response.data;
};

export const updatePassengerPassport = async (
  identificationNumber: string,
  countryIsoCode: string,
  newPassportNumber: string,
): Promise<Passenger> => {
  const response = await apiClient.patch<Passenger>(
    "/v1/passengers/passport",
    null,
    { params: { identificationNumber, countryIsoCode, newPassportNumber } },
  );
  return response.data;
};
