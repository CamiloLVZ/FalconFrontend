import type { ResponseRoute, RouteStatusAction } from "../types/routeTypes";
import { RouteRowActions } from "./RouteRowActions";
import { RouteStatusBadge } from "./RouteStatusBadge";
import { OperatingDaysBadge } from "./OperatingDaysBadge";
import { formatFlightDuration } from "../utils/routes.utils";

interface RouteTableProps {
  routes: ResponseRoute[];
  onStatusAction: (flightNumber: string, action: RouteStatusAction) => void;
  onEdit?: (route: ResponseRoute) => void;
}

export const RouteTable = ({
  routes,
  onStatusAction,
  onEdit,
}: RouteTableProps) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Número de vuelo
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Origen
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Destino
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Duración
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Tipo de aeronave
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Días de operación
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Estado
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {routes.map((route) => (
          <tr key={route.flightNumber} className="hover:bg-gray-50">
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
              {route.flightNumber}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {route.airportOrigin.iataCode}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {route.airportDestination.iataCode}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {formatFlightDuration(route.durationMinutes)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {route.defaultAirplaneType.producer}{" "}
              {route.defaultAirplaneType.model}
            </td>
            <td className="px-6 py-4 text-sm">
              <OperatingDaysBadge
                days={route.daysOfWeek || []}
                schedules={route.schedules}
              />
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
              <RouteStatusBadge status={route.status} />
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
              <RouteRowActions
                route={route}
                onStatusAction={onStatusAction}
                onEdit={onEdit}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
