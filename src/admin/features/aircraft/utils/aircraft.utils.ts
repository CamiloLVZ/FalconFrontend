import type { AircraftType } from "../types/aircraftType";

export const replaceAircraftInList = (
  aircrafts: AircraftType[],
  updatedAircraft: AircraftType,
) => {
  return aircrafts.map((aircraft) =>
    aircraft.id === updatedAircraft.id ? updatedAircraft : aircraft,
  );
};
