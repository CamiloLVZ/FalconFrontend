import { apiClient } from "../../../../api/axios";
import type { PagedResponse } from "../../../../types/pagedResponse";
import type {
  ResponseRoute,
  CreateRouteRequest,
  UpdateRouteRequest,
  AddRouteScheduleRequest,
  RouteWithSchedules,
} from "../types/routeTypes";

export const getAllRoutes = async (
  size: number,
  page: number,
): Promise<PagedResponse<ResponseRoute>> => {
  const response = await apiClient.get<PagedResponse<ResponseRoute>>(
    "/v1/routes",
    { params: { size, page } },
  );
  return response.data;
};

export const getRouteByFlightNumber = async (
  flightNumber: string,
): Promise<ResponseRoute> => {
  const response = await apiClient.get<ResponseRoute>(
    `/v1/routes/${flightNumber}`,
  );
  return response.data;
};

export const addRoute = async (
  route: CreateRouteRequest,
): Promise<ResponseRoute> => {
  const response = await apiClient.post<ResponseRoute>("/v1/routes", route);
  return response.data;
};

export const updateRoute = async (
  flightNumber: string,
  updateRequest: UpdateRouteRequest,
): Promise<ResponseRoute> => {
  const response = await apiClient.put<ResponseRoute>(
    `/v1/routes/${flightNumber}`,
    updateRequest,
  );
  return response.data;
};

export const activateRoute = async (
  flightNumber: string,
): Promise<ResponseRoute> => {
  const response = await apiClient.patch<ResponseRoute>(
    `/v1/routes/${flightNumber}/activate`,
  );
  return response.data;
};

export const deactivateRoute = async (
  flightNumber: string,
): Promise<ResponseRoute> => {
  const response = await apiClient.patch<ResponseRoute>(
    `/v1/routes/${flightNumber}/deactivate`,
  );
  return response.data;
};

export const setRouteOperatingSchedules = async (
  flightNumber: string,
  schedules: AddRouteScheduleRequest,
): Promise<RouteWithSchedules> => {
  const response = await apiClient.patch<RouteWithSchedules>(
    `/v1/routes/${flightNumber}/schedules`,
    schedules,
  );
  return response.data;
};

export const getRouteOperatingSchedules = async (
  flightNumber: string,
): Promise<RouteWithSchedules> => {
  const response = await apiClient.get<RouteWithSchedules>(
    `/v1/routes/${flightNumber}/schedules`,
  );
  return response.data;
};
