import { apiClient } from "../api/axios";

export interface AirportOption {
  iataCode: string;
  city: string;
  name: string;
}

export interface AirplaneTypeOption {
  id: number;
  producer: string;
  model: string;
}

export interface CountryOption {
  name: string;
  isoCode: string;
}

interface CatalogDropdownDto {
  airports: AirportOption[];
  airplaneTypes: AirplaneTypeOption[];
  countries: CountryOption[];
}

export const getDropdownOptions = async (): Promise<CatalogDropdownDto> => {
  const response = await apiClient.get<CatalogDropdownDto>("/v1/catalog/dropdown-options");
  return response.data;
};
