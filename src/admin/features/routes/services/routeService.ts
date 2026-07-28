import { apiClient } from "../../../../api/axios";
import type { PagedResponse } from "../../../../types/pagedResponse";
import type {
  Route,
  CreateRouteRequest,
  UpdateRouteRequest,
  SetRouteScheduleRequest,
  RouteSchedule,
} from "../types/routeTypes";

export const getAllRoutes = async (
  size: number,
  page: number,
  filters?: {
    originAirportIataCode?: string;
    destinationAirportIataCode?: string;
    status?: string;
    flightNumber?: string;
    airplaneTypeId?: number;
  },
): Promise<PagedResponse<Route>> => {
  const response = await apiClient.get<PagedResponse<Route>>("/v1/routes", {
    params: { size, page, ...filters },
  });
  return response.data;
};

export const getRouteByFlightNumber = async (flightNumber: string): Promise<Route> => {
  const response = await apiClient.get<Route>(`/v1/routes/${flightNumber}`);
  return response.data;
};

export const createRoute = async (data: CreateRouteRequest): Promise<Route> => {
  const response = await apiClient.post<Route>("/v1/routes", data);
  return response.data;
};

export const updateRoute = async (
  flightNumber: string,
  data: UpdateRouteRequest,
): Promise<Route> => {
  const response = await apiClient.put<Route>(`/v1/routes/${flightNumber}`, data);
  return response.data;
};

export const activateRoute = async (flightNumber: string): Promise<Route> => {
  const response = await apiClient.patch<Route>(`/v1/routes/${flightNumber}/activate`);
  return response.data;
};

export const deactivateRoute = async (flightNumber: string): Promise<Route> => {
  const response = await apiClient.patch<Route>(`/v1/routes/${flightNumber}/deactivate`);
  return response.data;
};

export const setRouteSchedule = async (
  flightNumber: string,
  data: SetRouteScheduleRequest,
): Promise<RouteSchedule> => {
  const response = await apiClient.patch<RouteSchedule>(
    `/v1/routes/${flightNumber}/schedules`,
    data,
  );
  return response.data;
};

export const getRouteSchedule = async (flightNumber: string): Promise<RouteSchedule> => {
  const response = await apiClient.get<RouteSchedule>(`/v1/routes/${flightNumber}/schedules`);
  return response.data;
};

// ─── Backward-compat aliases ─────────────────────────────────────
/** @deprecated Use setRouteSchedule instead */
export const setRouteOperatingSchedules = setRouteSchedule;

/** @deprecated Use getRouteSchedule instead */
export const getRouteOperatingSchedules = getRouteSchedule;
