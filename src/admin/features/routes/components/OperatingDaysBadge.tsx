import type { DayOfWeek } from "../types/routeTypes";
import { DAY_SHORT_LABELS, DAY_ORDER } from "../constants/routes.constants";

interface OperatingDaysBadgeProps {
  days: DayOfWeek[];
  schedules?: string[];
}

export const OperatingDaysBadge = ({ days, schedules }: OperatingDaysBadgeProps) => {
  const hasDays = days && days.length > 0;
  const hasSchedules = schedules && schedules.length > 0;

  if (!hasDays && !hasSchedules) {
    return (
      <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        Sin horarios
      </span>
    );
  }

  const sortedDays = hasDays
    ? days.toSorted((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
    : [];

  return (
    <div className="flex flex-col gap-1.5">
      {/* Días de la semana */}
      {hasDays && (
        <div className="flex flex-wrap gap-1">
          {sortedDays.map((day) => (
            <span
              key={day}
              className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
            >
              {DAY_SHORT_LABELS[day]}
            </span>
          ))}
        </div>
      )}

      {/* Horas de salida */}
      {hasSchedules && (
        <div className="flex flex-wrap items-center gap-1">
          <svg
            className="h-3.5 w-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {schedules.map((time) => (
            <span
              key={time}
              className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono font-medium text-gray-600 shadow-sm"
            >
              {time}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
