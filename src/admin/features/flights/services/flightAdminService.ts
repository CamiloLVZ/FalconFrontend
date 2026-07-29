import { apiClient } from "../../../../api/axios";
import type { PagedResponse } from "../../../../types/pagedResponse";
import type {
  CreateFlightDto,
  ResponseFlightDto,
} from "../types/flightTypes";

export const getFlightById = async (id: number): Promise<ResponseFlightDto> => {
  const response = await apiClient.get<ResponseFlightDto>(`/v1/flights/${id}`);
  return response.data;
};

export const getAllFlights = async (
  flightNumber: string | null = null,
  status: string | null = null,
  page = 0,
  size = 10,
  dateFrom?: string,
  dateTo?: string,
): Promise<PagedResponse<ResponseFlightDto>> => {
  const response = await apiClient.get<PagedResponse<ResponseFlightDto>>(
    "/v1/flights/all",
    {
      params: {
        flightNumber: flightNumber || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        size,
      },
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
