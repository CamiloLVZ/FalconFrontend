import type { AirplaneType } from "../types/airplaneTypeTypes";

export const replaceAircraftInList = (
  aircrafts: AirplaneType[],
  updatedAircraft: AirplaneType,
) => {
  return aircrafts.map((aircraft) =>
    aircraft.id === updatedAircraft.id ? updatedAircraft : aircraft,
  );
};
