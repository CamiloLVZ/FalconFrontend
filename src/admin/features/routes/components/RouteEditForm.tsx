import { useState, useEffect } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { updateRoute, setRouteOperatingSchedules, getRouteOperatingSchedules } from "../services/routeService";
import { DaySelection } from "./DaySelection";
import type { DayOfWeek, LocalTime, ResponseRoute } from "../types/routeTypes";
import type { Airport } from "../../airports/types/airportTypes";
import type { AirplaneType } from "../../aircraft/types/airplaneTypeTypes";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface RouteEditFormProps {
  route: ResponseRoute;
  airportsData: Airport[];
  aircraftsData: AirplaneType[];
  onClose: () => void;
  onUpdated: () => void;
}

export const RouteEditForm = ({ route, airportsData, aircraftsData, onClose, onUpdated }: RouteEditFormProps) => {
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [schedules, setSchedules] = useState<LocalTime[]>([]);
  const [newTime, setNewTime] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setScheduleLoading(true);
        const scheduleData = await getRouteOperatingSchedules(route.flightNumber);
        setSelectedDays(scheduleData.daysOfWeek || []);
        setSchedules(scheduleData.schedules || []);
      } catch {
        setSelectedDays([]);
        setSchedules([]);
      } finally {
        setScheduleLoading(false);
      }
    };
    loadSchedule();
  }, [route.flightNumber]);

  const saveEditedRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const originIata = (form.elements.namedItem("originIata") as HTMLSelectElement).value;
    const destinationIata = (form.elements.namedItem("destinationIata") as HTMLSelectElement).value;
    const aircraftId = parseInt((form.elements.namedItem("aircraftId") as HTMLSelectElement).value);
    const duration = parseInt((form.elements.namedItem("duration") as HTMLInputElement).value);
    const basePriceEconomy = parseFloat((form.elements.namedItem("basePriceEconomy") as HTMLInputElement).value);
    const basePriceFirstClass = parseFloat((form.elements.namedItem("basePriceFirstClass") as HTMLInputElement).value);
    try {
      setEditSubmitting(true);
      setEditError(null);
      await updateRoute(route.flightNumber, {
        airportOriginIataCode: originIata,
        airportDestinationIataCode: destinationIata,
        idDefaultAirplaneType: aircraftId,
        durationMinutes: duration,
        basePriceEconomy,
        basePriceFirstClass,
      });
      setEditError(null);
    } catch (err) {
      setEditError(getApiErrorMessage(err, "No se pudo actualizar la ruta."));
    } finally {
      setEditSubmitting(false);
    }
  };

  const saveEditedSchedule = async () => {
    if (selectedDays.length === 0) {
      setLoadError("Debe seleccionar al menos un día de operación");
      return;
    }
    if (schedules.length === 0) {
      setLoadError("Debe agregar al menos una hora de salida");
      return;
    }
    try {
      setScheduleSubmitting(true);
      setScheduleError(null);
      const scheduleData = await setRouteOperatingSchedules(route.flightNumber, {
        daysOfWeek: selectedDays,
        schedules,
      });
      setSelectedDays(scheduleData.daysOfWeek);
      setSchedules(scheduleData.schedules);
      setScheduleError(null);
      onUpdated();
    } catch (err) {
      setScheduleError(getApiErrorMessage(err, "No se pudo actualizar los horarios."));
    } finally {
      setScheduleSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-8">
      <form className="space-y-4" onSubmit={saveEditedRoute}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Número de vuelo</label>
          <input
            type="text"
            value={route.flightNumber}
            aria-label="Número de vuelo"
            disabled
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-500 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Aeropuerto de origen</label>
          <select
            name="originIata"
            aria-label="Aeropuerto de origen"
            defaultValue={route.airportOrigin.iataCode}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          >
            <option value="">Seleccionar origen</option>
            {airportsData.map((airport) => (
              <option key={airport.iataCode} value={airport.iataCode}>
                {airport.iataCode} - {airport.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Aeropuerto de destino</label>
          <select
            name="destinationIata"
            aria-label="Aeropuerto de destino"
            defaultValue={route.airportDestination.iataCode}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          >
            <option value="">Seleccionar destino</option>
            {airportsData.map((airport) => (
              <option key={airport.iataCode} value={airport.iataCode}>
                {airport.iataCode} - {airport.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de aeronave (activas)</label>
          <select
            name="aircraftId"
            aria-label="Tipo de aeronave (activas)"
            defaultValue={route.defaultAirplaneType.id}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          >
            <option value="">Seleccionar aeronave</option>
            {aircraftsData.filter((a) => a.status === "ACTIVE").map((aircraft) => (
              <option key={aircraft.id} value={aircraft.id}>
                {aircraft.producer} {aircraft.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duración del vuelo (minutos)</label>
          <input
            name="duration"
            aria-label="Duración del vuelo (minutos)"
            type="number"
            min={1}
            defaultValue={route.durationMinutes ?? route.lengthMinutes ?? 0}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Precio base (Economy)</label>
          <input
            name="basePriceEconomy"
            aria-label="Precio base (Economy)"
            type="number"
            step="0.01"
            min={0}
            defaultValue={route.basePriceEconomy ?? 0}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Precio base (First Class)</label>
          <input
            name="basePriceFirstClass"
            aria-label="Precio base (First Class)"
            type="number"
            step="0.01"
            min={0}
            defaultValue={route.basePriceFirstClass ?? 0}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
          <button type="submit" disabled={editSubmitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{editSubmitting ? "Guardando..." : "Guardar"}</button>
        </div>

        {editError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{editError}</div>}
      </form>

      <div className="pt-6 border-t">
        <h2 className="text-lg font-semibold mb-4">Horarios</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Días de operación</label>
            {scheduleLoading ? (
              <div className="text-center text-sm text-gray-500">Cargando días...</div>
            ) : (
              <DaySelection selectedDays={selectedDays} onDaysChange={setSelectedDays} />
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Horas de salida</label>
            {scheduleLoading ? (
              <div className="text-center text-sm text-gray-500">Cargando horarios...</div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                  {schedules.length === 0 ? (
                    <span className="text-sm text-gray-400 self-center">No hay horas de salida configuradas</span>
                  ) : (
                    schedules.map((time) => (
                      <span key={time} className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-mono font-medium text-blue-700 shadow-sm border border-blue-100">
                        {time}
                        <button type="button" onClick={() => setSchedules((prev) => prev.filter((t) => t !== time))} className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none">
                          <span className="sr-only">Eliminar horario</span>
                          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    aria-label="Horas de salida"
                    className="block flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button type="button" onClick={handleAddTime} className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">Agregar</button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
            <button type="button" onClick={saveEditedSchedule} disabled={scheduleSubmitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{scheduleSubmitting ? "Guardando..." : "Guardar Horarios"}</button>
          </div>

          {(scheduleError || loadError) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{scheduleError || loadError}</div>
          )}
        </div>
      </div>
    </div>
  );
};
