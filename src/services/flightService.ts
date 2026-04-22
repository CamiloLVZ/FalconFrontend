import { apiClient } from "../api/axios";
import type { FlightResponse, FlightSearchParams } from "../types/flight";

export const searchFlights = async (
  params: FlightSearchParams,
): Promise<FlightResponse> => {
  const response = await apiClient.get<FlightResponse>("/v1/flights/search", {
    params,
  });

  return response.data;
};
