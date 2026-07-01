import type { AircraftType } from "../types/aircraftTypes";

export const replaceAircraftInList = (
  aircrafts: AircraftType[],
  updatedAircraft: AircraftType,
) => {
  return aircrafts.map((aircraft) =>
    aircraft.id === updatedAircraft.id ? updatedAircraft : aircraft,
  );
};
