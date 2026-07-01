/**
 * @deprecated Use global flight types instead.
 * This file is kept for backward compatibility with existing components.
 */
import type {
  FlightStatus,
  Flight,
  CreateFlightRequest,
  RescheduleFlightRequest,
  ChangeAirplaneTypeRequest,
} from "../../../../../types/flight";

export type {
  FlightStatus,
  Flight,
  CreateFlightRequest as CreateFlightDto,
  Flight as ResponseFlightDto,
  RescheduleFlightRequest,
  ChangeAirplaneTypeRequest,
};
