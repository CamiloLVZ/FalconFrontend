import { apiClient } from "../api/axios";
import type { CleanFilters, Flight } from "../types/flight";
import type { FlightSeatMap } from "../types/seatMap";

type FlightSearchResponse = Flight[] | { data: Flight[] };

export const getFlightSeatMap = async (flightId: number): Promise<FlightSeatMap> => {
  const response = await apiClient.get<FlightSeatMap>(`/v1/flights/${flightId}/seats`);
  return response.data;
};


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
