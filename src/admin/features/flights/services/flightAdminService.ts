import { apiClient } from "../../../../api/axios";
import type { PagedResponse } from "../../../../types/pagedResponse";
import type {
  CreateFlightDto,
  Flight,
  ResponseFlightDto,
} from "../types/flightTypes";

export const getFlightById = async (id: number): Promise<ResponseFlightDto> => {
  const response = await apiClient.get<ResponseFlightDto>(`/v1/flights/${id}`);
  return response.data;
};

export const getAllFlights = async (
  flightNumber = null,
  page = 0,
  size = 10,
): Promise<PagedResponse<ResponseFlightDto>> => {
  const response = await apiClient.get<PagedResponse<ResponseFlightDto>>(
    "/v1/flights",
    {
      params: { flightNumber: flightNumber || undefined, page, size },
    },
  );
  return response.data;
};

export const createFlight = async (
  flightData: CreateFlightDto,
): Promise<ResponseFlightDto> => {
  const response = await apiClient.post<ResponseFlightDto>(
    "/v1/flights",
    flightData,
  );
  return response.data;
};

export const rescheduleFlight = async (
  id: number,
  newDepartureDateTime: string,
): Promise<Flight> => {
  const response = await apiClient.post(`/v1/flights/${id}/reschedule`, {
    params: { newDepartureDateTime: newDepartureDateTime },
  });
  return response.data;
};

export const cancelFlight = async (id: number): Promise<Flight> => {
  const response = await apiClient.patch(`/v1/flights/${id}/cancel`);
  return response.data;
};

export const changeAirplaneType = async (
  id: number,
  idAirplaneType: number,
): Promise<Flight> => {
  const response = await apiClient.patch(
    `/v1/flights/${id}/change-airplane-type`,
    { params: { idAirplaneType: idAirplaneType } },
  );
  return response.data;
};
