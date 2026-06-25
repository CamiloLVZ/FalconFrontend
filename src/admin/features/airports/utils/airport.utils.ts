import type { Airport } from "../types/AirportTypes";

export type FilterField = "iataCode" | "name" | "city" | "country";
export const getAirportFieldValue = (
  airport: Airport,
  field: FilterField,
): string => {
  switch (field) {
    case "iataCode":
      return airport.iataCode;

    case "name":
      return airport.name;

    case "city":
      return airport.city;

    case "country":
      return airport.country.name;
  }
};
