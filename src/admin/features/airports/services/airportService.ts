import { apiClient } from "../../../../api/axios";
import type { PagedResponse } from "../../../../types/pagedResponse";
import type { Airport } from "../types/airportTypes";

export const getAllAirports = async (
  size: number,
  page: number,
): Promise<PagedResponse<Airport>> => {
  const response = await apiClient.get<PagedResponse<Airport>>("/v1/airports", {
    params: { size, page },
  });
  return response.data;
};

export const getAirportByIataCode = async (
  iataCode: string,
): Promise<Airport> => {
  const response = await apiClient.get<Airport>(`/v1/airports/${iataCode}`);
  return response.data;
};
