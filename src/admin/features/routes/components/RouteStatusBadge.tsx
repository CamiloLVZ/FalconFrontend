import { STATUS_LABELS, STATUS_STYLES } from "../constants/routes.constants";
import type { RouteStatus } from "../types/routeTypes";

interface RouteStatusBadgeProps {
  status: RouteStatus;
}

export const RouteStatusBadge = ({ status }: RouteStatusBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
};
