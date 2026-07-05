import type { ResponseRoute } from "../types/routeTypes";

export const replaceRouteInList = (
  routes: ResponseRoute[],
  updatedRoute: ResponseRoute,
) => {
  return routes.map((route) =>
    route.flightNumber === updatedRoute.flightNumber ? updatedRoute : route,
  );
};

export const formatFlightDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};
