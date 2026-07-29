import { apiClient } from "../api/axios";
import type { AirportSearchOption } from "../types/airportSearch";

export const getAvailableOrigins = async (): Promise<AirportSearchOption[]> => {
  const response = await apiClient.get<AirportSearchOption[]>(
    "/v1/catalog/origin-airports",
  );
  return response.data;
};

export const getAvailableDestinations = async (
  originIataCode: string,
): Promise<AirportSearchOption[]> => {
  const response = await apiClient.get<AirportSearchOption[]>(
    `/v1/catalog/destination-airports`,
    {
      params: {
        originIataCode: originIataCode,
      },
    },
  );

  return response.data;
};
