import { apiClient } from "../../../../api/axios";
import type {
  Flight,
  CreateFlightRequest,
  RescheduleFlightRequest,
  ChangeAirplaneTypeRequest,
} from "../types/flightTypes";
import type { PagedResponse } from "../../../../types/pagedResponse";

export const getAllFlights = async (
  page = 0,
  size = 10,
): Promise<PagedResponse<Flight>> => {
  const response = await apiClient.get<PagedResponse<Flight>>("/v1/flights", {
    params: { page, size },
  });
  return response.data;
};

export const getFlightById = async (id: number): Promise<Flight> => {
  const response = await apiClient.get<Flight>(`/v1/flights/${id}`);
  return response.data;
};

export const createFlight = async (data: CreateFlightRequest): Promise<Flight> => {
  const response = await apiClient.post<Flight>("/v1/flights", data);
  return response.data;
};

export const rescheduleFlight = async (
  id: number,
  data: RescheduleFlightRequest,
): Promise<Flight> => {
  const response = await apiClient.post<Flight>(`/v1/flights/${id}/reschedule`, data);
  return response.data;
};

export const cancelFlight = async (id: number): Promise<Flight> => {
  const response = await apiClient.patch<Flight>(`/v1/flights/${id}/cancel`);
  return response.data;
};

export const changeAirplaneType = async (
  id: number,
  data: ChangeAirplaneTypeRequest,
): Promise<Flight> => {
  const response = await apiClient.patch<Flight>(
    `/v1/flights/${id}/change-airplane-type`,
    data,
  );
  return response.data;
};
