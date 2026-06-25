import { useEffect, useState } from "react";
import { AdminModal } from "../../../../components/AdminModal";
import { FormActions } from "../../../../components/FormActions";
import { FormError } from "../../../../components/FormError";
import { DaySelection } from "../DaySelection";
import type {
  DayOfWeek,
  ResponseRoute,
  LocalTime,
} from "../../types/routeTypes";
import { getRouteOperatingSchedules } from "../../services/routeService";

interface EditScheduleModalProps {
  route: ResponseRoute;
  onSave: (
    flightNumber: string,
    daysOfWeek: DayOfWeek[],
    schedules: LocalTime[],
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export const EditScheduleModal = ({
  route,
  onSave,
  onCancel,
  isSubmitting,
  error,
}: EditScheduleModalProps) => {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [schedules, setSchedules] = useState<LocalTime[]>([]);
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        const scheduleData = await getRouteOperatingSchedules(
          route.flightNumber,
        );
        setSelectedDays(scheduleData.daysOfWeek || []);
        setSchedules(scheduleData.schedules || []);
      } catch {
        // Si falla, iniciamos con días vacíos
        setSelectedDays([]);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [route.flightNumber]);

  const handleAddTime = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newTime) return;

    if (schedules.includes(newTime)) {
      setLoadError("Este horario ya ha sido agregado.");
      return;
    }

    setLoadError(null);
    setSchedules((prev) => [...prev, newTime].sort());
    setNewTime("");
  };

  const handleRemoveTime = (timeToRemove: LocalTime) => {
    setSchedules((prev) => prev.filter((t) => t !== timeToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      setLoadError("Debe seleccionar al menos un día de operación");
      return;
    }
    if (schedules.length === 0) {
      setLoadError("Debe agregar al menos una hora de salida");
      return;
    }
    setLoadError(null);
    onSave(route.flightNumber, selectedDays, schedules);
  };

  return (
    <AdminModal title="Editar horarios de operación">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h3 className="mb-2 font-medium text-gray-900">
            Ruta: <span className="font-bold">{route.flightNumber}</span>
          </h3>
          <p className="text-sm text-gray-600">
            {route.airportOrigin.iataCode} → {route.airportDestination.iataCode}
          </p>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Días de operación
          </label>
          {loading ? (
            <div className="text-center text-sm text-gray-500">
              Cargando días...
            </div>
          ) : (
            <DaySelection
              selectedDays={selectedDays}
              onDaysChange={setSelectedDays}
            />
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Horas de salida
          </label>
          {loading ? (
            <div className="text-center text-sm text-gray-500">
              Cargando horarios...
            </div>
          ) : (
            <div className="space-y-3">
              {/* Listado de horas */}
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                {schedules.length === 0 ? (
                  <span className="text-sm text-gray-400 self-center">
                    No hay horas de salida configuradas
                  </span>
                ) : (
                  schedules.map((time) => (
                    <span
                      key={time}
                      className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-mono font-medium text-blue-700 shadow-sm border border-blue-100"
                    >
                      {time}
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(time)}
                        className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                      >
                        <span className="sr-only">Eliminar horario</span>
                        <svg
                          className="h-2 w-2"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 8 8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeWidth="1.5"
                            d="M1 1l6 6m0-6L1 7"
                          />
                        </svg>
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Agregar hora */}
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition duration-150 ease-in-out cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}
        </div>

        <FormActions
          isSubmitting={isSubmitting || loading}
          onCancel={onCancel}
        />
        <FormError error={error || loadError} />
      </form>
    </AdminModal>
  );
};
