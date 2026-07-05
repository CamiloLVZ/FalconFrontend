import { apiClient } from "../../../../api/axios";
import type { FlightGeneration } from "../types/flightGenerationTypes";
import type { PagedResponse } from "../../../../types/pagedResponse";

export const getAllGenerations = async (
  page = 0,
  size = 10,
): Promise<PagedResponse<FlightGeneration>> => {
  const response = await apiClient.get<PagedResponse<FlightGeneration>>(
    "/v1/flights/generations",
    { params: { page, size } },
  );
  return response.data;
};

export const getGenerationById = async (id: number): Promise<FlightGeneration> => {
  const response = await apiClient.get<FlightGeneration>(`/v1/flights/generations/${id}`);
  return response.data;
};

export const generateFlights = async (routeFlightNumber?: string): Promise<FlightGeneration> => {
  // Assuming POST /v1/flights/generations with optional route ID
  const response = await apiClient.post<FlightGeneration>(
    "/v1/flights/generations",
    routeFlightNumber ? { routeFlightNumber } : {}
  );
  return response.data;
};
