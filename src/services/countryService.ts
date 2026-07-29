import { apiClient } from "../api/axios";
import type { Country } from "../types/country";
import type { PagedResponse } from "../types/pagedResponse";

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
  size = 10,
  page = 0,
): Promise<PagedResponse<Country>> => {
  const response = await apiClient.get<PagedResponse<Country>>(
    `/v1/countries/${isoCode}/airports`,
    { params: { size, page } },
  );
  return response.data;
};
