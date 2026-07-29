import { apiClient } from "../../../../api/axios";
import type { FlightGeneration } from "../types/flightGenerationTypes";
import type { PagedResponse } from "../../../../types/pagedResponse";

export const getAllGenerations = async (
  page = 0,
  size = 10,
  filters?: {
    type?: string;
    status?: string;
    routeFlightNumber?: string;
  },
): Promise<PagedResponse<FlightGeneration>> => {
  const response = await apiClient.get<PagedResponse<FlightGeneration>>(
    "/v1/flights/generations",
    { params: { page, size, ...filters } },
  );
  return response.data;
};

export const getGenerationById = async (id: number): Promise<FlightGeneration> => {
  const response = await apiClient.get<FlightGeneration>(`/v1/flights/generations/${id}`);
  return response.data;
};

export const generateFlightsForRoute = async (
  flightNumber: string,
): Promise<FlightGeneration> => {
  const response = await apiClient.post<FlightGeneration>(
    `/v1/routes/${flightNumber}/generateFlights`,
  );
  return response.data;
};

export const generateFlightsForAllRoutes = async (): Promise<FlightGeneration[]> => {
  const response = await apiClient.post<FlightGeneration[]>(
    "/v1/routes/generateFlights",
  );
  return response.data;
};
