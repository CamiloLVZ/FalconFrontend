import { apiClient } from "../api/axios";
import type { CleanFilters, FlightResponse } from "../types/flight";

export const searchFlights = async (
  params: CleanFilters,
): Promise<FlightResponse> => {
  const response = await apiClient.get<FlightResponse>("/v1/flights/search", {
    params,
  });

  return response.data;
};
