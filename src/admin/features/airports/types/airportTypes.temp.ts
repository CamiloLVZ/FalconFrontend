import type { Country } from "../../../../types/country";

export interface Airport {
  iataCode: string;
  name: string;
  city: string;
  country: Country;
  timezone: string;
}
