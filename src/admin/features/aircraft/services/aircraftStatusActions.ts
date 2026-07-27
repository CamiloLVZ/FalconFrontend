import type {
  AircraftStatusAction,
  AirplaneType,
} from "../types/airplaneTypeTypes";
import {
  activateAircraft,
  deactivateAircraft,
  retireAircraft,
} from "./aircraftService";

export const STATUS_ACTION_SERVICES: Record<
  AircraftStatusAction,
  (id: number) => Promise<AirplaneType>
> = {
  ACTIVATE: activateAircraft,
  DEACTIVATE: deactivateAircraft,
  RETIRE: retireAircraft,
};
