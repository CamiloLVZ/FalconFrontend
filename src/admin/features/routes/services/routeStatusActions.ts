import type { RouteStatusAction, ResponseRoute } from "../types/routeTypes";
import { activateRoute, deactivateRoute } from "./routeService";

export const STATUS_ACTION_SERVICES: Record<
  RouteStatusAction,
  (flightNumber: string) => Promise<ResponseRoute>
> = {
  ACTIVATE: activateRoute,
  DEACTIVATE: deactivateRoute,
};
