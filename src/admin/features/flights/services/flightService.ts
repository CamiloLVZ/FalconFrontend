import { apiClient } from "../../../../api/axios";
import type { CreateFlightDto, ResponseFlightDto } from "../types/flightTypes";
import type { PagedResponse } from "../../../../types/pagedResponse";

export const getAllFlights = async (
  page = 0,
  size = 10,
): Promise<PagedResponse<ResponseFlightDto>> => {
  const response = await apiClient.get<PagedResponse<ResponseFlightDto>>("/v1/flights", {
    params: { page, size },
  });
  return response.data;
};

export const getFlightById = async (id: number): Promise<ResponseFlightDto> => {
  const response = await apiClient.get<ResponseFlightDto>(`/v1/flights/${id}`);
  return response.data;
};

export const createFlight = async (data: CreateFlightDto): Promise<ResponseFlightDto> => {
  const response = await apiClient.post<ResponseFlightDto>("/v1/flights", data);
  return response.data;
};

export const rescheduleFlight = async (
  id: number,
  newDepartureLocalDateTime: string,
): Promise<ResponseFlightDto> => {
  const response = await apiClient.post<ResponseFlightDto>(`/v1/flights/${id}/reschedule`, null, {
    params: { newDepartureLocalDateTime },
  });
  return response.data;
};

export const cancelFlight = async (id: number): Promise<ResponseFlightDto> => {
  const response = await apiClient.patch<ResponseFlightDto>(`/v1/flights/${id}/cancel`);
  return response.data;
};

export const changeAirplaneType = async (
  id: number,
  idAirplaneType: number,
): Promise<ResponseFlightDto> => {
  const response = await apiClient.patch<ResponseFlightDto>(
    `/v1/flights/${id}/change-airplane-type`,
    null,
    { params: { idAirplaneType } },
  );
  return response.data;
};
