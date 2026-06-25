import type { ChangeEvent } from "react";
import {
  ACTION_LABELS,
  AVAILABLE_ACTIONS,
} from "../constants/routes.constants";
import type { ResponseRoute, RouteStatusAction } from "../types/routeTypes";

interface RouteRowActionsProps {
  route: ResponseRoute;
  onEditRoute?: (route: ResponseRoute) => void;
  onEditSchedule?: (route: ResponseRoute) => void;
  onStatusAction: (
    flightNumber: string,
    action: RouteStatusAction,
  ) => void;
}

export const RouteRowActions = ({
  route,
  onEditRoute,
  onEditSchedule,
  onStatusAction,
}: RouteRowActionsProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (value === "EDIT_ROUTE") {
      onEditRoute?.(route);
    } else if (value === "EDIT_SCHEDULE") {
      onEditSchedule?.(route);
    } else if (value) {
      onStatusAction(route.flightNumber, value as RouteStatusAction);
    }

    event.target.value = "";
  };

  return (
    <select
      aria-label={`Acciones para ruta ${route.flightNumber}`}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      defaultValue=""
      onChange={handleChange}
    >
      <option value="" disabled>
        Acciones
      </option>
      <optgroup label="Editar">
        <option value="EDIT_ROUTE">Editar ruta</option>
        <option value="EDIT_SCHEDULE">Editar horarios</option>
      </optgroup>
      {AVAILABLE_ACTIONS[route.status].length > 0 ? (
        <optgroup label="Estado">
          {AVAILABLE_ACTIONS[route.status].map((action) => (
            <option key={action} value={action}>
              {ACTION_LABELS[action]}
            </option>
          ))}
        </optgroup>
      ) : null}
    </select>
  );
};
