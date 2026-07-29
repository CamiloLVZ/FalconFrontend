import { apiClient } from "../../../../api/axios";
import type { PagedResponse } from "../../../../types/pagedResponse";
import type { Airport } from "../types/airportTypes";

export interface CreateCountryData {
  name: string;
  isoCode: string;
}

export interface CreateAirportData {
  iataCode: string;
  name: string;
  city: string;
  countryIsoCode: string;
  timezone: string;
}

export const createAirport = async (
  data: CreateAirportData,
): Promise<Airport> => {
  const response = await apiClient.post<Airport>("/v1/airports", data);
  return response.data;
};

export const createCountry = async (
  data: CreateCountryData,
): Promise<{ name: string; isoCode: string }> => {
  const response = await apiClient.post<{ name: string; isoCode: string }>(
    "/v1/countries",
    data,
  );
  return response.data;
};

export const getAllAirports = async (
  size: number,
  page: number,
  country?: string,
  search?: string,
): Promise<PagedResponse<Airport>> => {
  const response = await apiClient.get<PagedResponse<Airport>>("/v1/airports", {
    params: { size, page, country: country || undefined, search: search || undefined },
  });
  return response.data;
};

export const getAirportByIataCode = async (
  iataCode: string,
): Promise<Airport> => {
  const response = await apiClient.get<Airport>(`/v1/airports/${iataCode}`);
  return response.data;
};
