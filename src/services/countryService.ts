import { apiClient } from "../api/axios";
import type { Country } from "../types/country";
import type { AirportSearchOption } from "../types/airportSearch";

export const getCountryByIsoCode = async (
  isoCode: string,
): Promise<Country> => {
  const response = await apiClient.get<Country>(`/v1/countries/${isoCode}`);
  return response.data;
};

export const getAllCountries = async (): Promise<Country[]> => {
  const response = await apiClient.get<Country[]>("/v1/countries");
  return response.data;
};

export const getAirportsByCountry = async (
  isoCode: string,
): Promise<AirportSearchOption[]> => {
  const response = await apiClient.get<AirportSearchOption[]>(
    `/v1/countries/${isoCode}/airports`,
  );
  return response.data;
};
