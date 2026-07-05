import type { DayOfWeek } from "../types/routeTypes";
import { DAY_LABELS, DAY_ORDER } from "../constants/routes.constants";

interface DaySelectionProps {
  selectedDays: DayOfWeek[];
  onDaysChange: (days: DayOfWeek[]) => void;
}

export const DaySelection = ({
  selectedDays,
  onDaysChange,
}: DaySelectionProps) => {
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  const selectAll = () => {
    if (selectedDays.length === DAY_ORDER.length) {
      onDaysChange([]);
    } else {
      onDaysChange([...DAY_ORDER]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <button
          type="button"
          onClick={selectAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {selectedDays.length === DAY_ORDER.length
            ? "Deseleccionar todo"
            : "Seleccionar todo"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {DAY_ORDER.map((day) => (
          <label
            key={day}
            className="flex cursor-pointer items-center space-x-2 rounded-md border border-gray-300 p-3 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedDays.includes(day)}
              onChange={() => toggleDay(day)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {DAY_LABELS[day]}
            </span>
          </label>
        ))}
      </div>

      {selectedDays.length === 0 && (
        <p className="text-sm text-amber-600">
          ⚠️ Selecciona al menos un día para operar la ruta
        </p>
      )}
    </div>
  );
};
