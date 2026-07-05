import type {
  AircraftStatusAction,
  AircraftType,
} from "../types/aircraftTypes";
import {
  activateAircraft,
  deactivateAircraft,
  retireAircraft,
} from "./aircraftService";

export const STATUS_ACTION_SERVICES: Record<
  AircraftStatusAction,
  (id: number) => Promise<AircraftType>
> = {
  ACTIVATE: activateAircraft,
  DEACTIVATE: deactivateAircraft,
  RETIRE: retireAircraft,
};
