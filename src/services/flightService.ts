import { apiClient } from "../api/axios";
import type { CleanFilters, Flight } from "../types/flight";

type FlightSearchResponse = Flight[] | { data: Flight[] };

export const searchFlights = async (
  params: CleanFilters,
): Promise<Flight[]> => {
  const response = await apiClient.get<FlightSearchResponse>(
    "/v1/flights/search",
    {
      params,
    },
  );

  const responseData = response.data;

  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }

  return [];
};
