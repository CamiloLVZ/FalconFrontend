import { useEffect, useReducer } from "react";
import type { Reducer } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { updateRoute, setRouteOperatingSchedules, getRouteOperatingSchedules } from "../services/routeService";
import { DaySelection } from "./DaySelection";
import type { DayOfWeek, LocalTime, ResponseRoute } from "../types/routeTypes";
import type { AirportOption, AirplaneTypeOption } from "../../../../services/catalogService";
import { SuccessMessage } from "../../../components/SuccessMessage";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface EditFormState {
  submitting: boolean;
  error: string | null;
  success: string | null;
}

type EditFormAction =
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; payload: string }
  | { type: "SUBMIT_ERROR"; payload: string }
  | { type: "DISMISS_SUCCESS" };

const editFormReducer: Reducer<EditFormState, EditFormAction> = (state, action) => {
  switch (action.type) {
    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_SUCCESS":
      return { ...state, submitting: false, error: null, success: action.payload };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.payload };
    case "DISMISS_SUCCESS":
      return { ...state, success: null };
  }
};

interface ScheduleState {
  loading: boolean;
  selectedDays: DayOfWeek[];
  schedules: LocalTime[];
  newTime: string;
  loadError: string | null;
  submitting: boolean;
  error: string | null;
  success: string | null;
}

type ScheduleAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; daysOfWeek: DayOfWeek[]; schedules: LocalTime[] }
  | { type: "LOAD_FAILURE" }
  | { type: "SET_DAYS"; days: DayOfWeek[] }
  | { type: "SET_NEW_TIME"; value: string }
  | { type: "ADD_TIME" }
  | { type: "REMOVE_TIME"; time: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; daysOfWeek: DayOfWeek[]; schedules: LocalTime[] }
  | { type: "SUBMIT_ERROR"; payload: string }
  | { type: "SET_LOAD_ERROR"; payload: string }
  | { type: "DISMISS_SUCCESS" };

const scheduleReducer: Reducer<ScheduleState, ScheduleAction> = (state, action) => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true };
    case "LOAD_SUCCESS":
      return { ...state, loading: false, loadError: null, selectedDays: action.daysOfWeek, schedules: action.schedules };
    case "LOAD_FAILURE":
      return { ...state, loading: false, selectedDays: [], schedules: [] };
    case "SET_DAYS":
      return { ...state, selectedDays: action.days };
    case "SET_NEW_TIME":
      return { ...state, newTime: action.value };
    case "ADD_TIME": {
      const newTime = state.newTime.trim();
      if (!newTime) return state;
      if (state.schedules.includes(newTime)) {
        return { ...state, loadError: "Este horario ya ha sido agregado." };
      }
      return { ...state, loadError: null, schedules: [...state.schedules, newTime].sort(), newTime: "" };
    }
    case "REMOVE_TIME":
      return { ...state, schedules: state.schedules.filter((t) => t !== action.time) };
    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_SUCCESS":
      return { ...state, submitting: false, error: null, success: "Horarios guardados exitosamente.", selectedDays: action.daysOfWeek, schedules: action.schedules };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.payload };
    case "SET_LOAD_ERROR":
      return { ...state, loadError: action.payload };
    case "DISMISS_SUCCESS":
      return { ...state, success: null };
  }
};

interface RouteEditFormProps {
  route: ResponseRoute;
  airportsData: AirportOption[];
  aircraftsData: AirplaneTypeOption[];
  onClose: () => void;
  onUpdated: () => void;
}

export const RouteEditForm = ({ route, airportsData, aircraftsData, onClose, onUpdated }: RouteEditFormProps) => {
  const [editState, editDispatch] = useReducer(editFormReducer, { submitting: false, error: null, success: null });
  const [scheduleState, scheduleDispatch] = useReducer(scheduleReducer, {
    loading: true,
    selectedDays: [],
    schedules: [],
    newTime: "",
    loadError: null,
    submitting: false,
    error: null,
    success: null,
  });

  useEffect(() => {
    let ignore = false;
    scheduleDispatch({ type: "LOAD_START" });
    getRouteOperatingSchedules(route.flightNumber).then((scheduleData) => {
      if (ignore) return;
      scheduleDispatch({ type: "LOAD_SUCCESS", daysOfWeek: scheduleData.daysOfWeek || [], schedules: scheduleData.schedules || [] });
    }).catch(() => {
      if (!ignore) {
        scheduleDispatch({ type: "LOAD_FAILURE" });
      }
    });
    return () => { ignore = true; };
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
      editDispatch({ type: "SUBMIT_START" });
      await updateRoute(route.flightNumber, {
        airportOriginIataCode: originIata,
        airportDestinationIataCode: destinationIata,
        idDefaultAirplaneType: aircraftId,
        durationMinutes: duration,
        basePriceEconomy,
        basePriceFirstClass,
      });
      editDispatch({ type: "SUBMIT_SUCCESS", payload: "Ruta actualizada exitosamente." });
    } catch (err) {
      editDispatch({ type: "SUBMIT_ERROR", payload: getApiErrorMessage(err, "No se pudo actualizar la ruta.") });
    }
  };

  const saveEditedSchedule = async () => {
    if (scheduleState.selectedDays.length === 0) {
      scheduleDispatch({ type: "SET_LOAD_ERROR", payload: "Debe seleccionar al menos un día de operación" });
      return;
    }
    if (scheduleState.schedules.length === 0) {
      scheduleDispatch({ type: "SET_LOAD_ERROR", payload: "Debe agregar al menos una hora de salida" });
      return;
    }
    try {
      scheduleDispatch({ type: "SUBMIT_START" });
      const scheduleData = await setRouteOperatingSchedules(route.flightNumber, {
        daysOfWeek: scheduleState.selectedDays,
        schedules: scheduleState.schedules,
      });
      scheduleDispatch({ type: "SUBMIT_SUCCESS", daysOfWeek: scheduleData.daysOfWeek, schedules: scheduleData.schedules });
      onUpdated();
    } catch (err) {
      scheduleDispatch({ type: "SUBMIT_ERROR", payload: getApiErrorMessage(err, "No se pudo actualizar los horarios.") });
    }
  };

  const handleAddTime = (e: React.MouseEvent) => {
    e.preventDefault();
    scheduleDispatch({ type: "ADD_TIME" });
  };

  return (
    <div className="space-y-8">
      <SuccessMessage message={editState.success} onDismiss={() => editDispatch({ type: "DISMISS_SUCCESS" })} />
      <SuccessMessage message={scheduleState.success} onDismiss={() => scheduleDispatch({ type: "DISMISS_SUCCESS" })} />
      <form className="space-y-4" onSubmit={saveEditedRoute}>
        <div>
          <label htmlFor="route-flightNumber" className="block text-sm font-medium text-gray-700">Número de vuelo</label>
          <input
            type="text"
            id="route-flightNumber"
            value={route.flightNumber}
            aria-label="Número de vuelo"
            disabled
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-500 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="originIata" className="block text-sm font-medium text-gray-700">Aeropuerto de origen</label>
          <select
            name="originIata"
            id="originIata"
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
          <label htmlFor="destinationIata" className="block text-sm font-medium text-gray-700">Aeropuerto de destino</label>
          <select
            name="destinationIata"
            id="destinationIata"
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
          <label htmlFor="aircraftId" className="block text-sm font-medium text-gray-700">Tipo de aeronave (activas)</label>
          <select
            name="aircraftId"
            id="aircraftId"
            aria-label="Tipo de aeronave (activas)"
            defaultValue={route.defaultAirplaneType.id}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          >
            <option value="">Seleccionar aeronave</option>
            {aircraftsData.map((aircraft) => (
              <option key={aircraft.id} value={aircraft.id}>{aircraft.producer} {aircraft.model}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duración del vuelo (minutos)</label>
          <input
            name="duration"
            id="duration"
            aria-label="Duración del vuelo (minutos)"
            type="number"
            min={1}
            defaultValue={route.durationMinutes ?? route.lengthMinutes ?? 0}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="basePriceEconomy" className="block text-sm font-medium text-gray-700">Precio base (Economy)</label>
          <input
            name="basePriceEconomy"
            id="basePriceEconomy"
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
          <label htmlFor="basePriceFirstClass" className="block text-sm font-medium text-gray-700">Precio base (First Class)</label>
          <input
            name="basePriceFirstClass"
            id="basePriceFirstClass"
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
          <button type="submit" disabled={editState.submitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{editState.submitting ? "Guardando..." : "Guardar"}</button>
        </div>

        {editState.error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{editState.error}</div>}
      </form>

      <div className="pt-6 border-t">
        <h2 className="text-lg font-semibold mb-4">Horarios</h2>
        <div className="space-y-4">
          <fieldset className="min-w-0 border-0 p-0 m-0">
            <legend className="mb-3 block text-sm font-medium text-gray-700">Días de operación</legend>
            {scheduleState.loading ? (
              <div className="text-center text-sm text-gray-500">Cargando días...</div>
            ) : (
              <DaySelection selectedDays={scheduleState.selectedDays} onDaysChange={(days) => scheduleDispatch({ type: "SET_DAYS", days })} />
            )}
          </fieldset>

          <div>
            <label htmlFor="route-schedule-time" className="mb-2 block text-sm font-medium text-gray-700">Horas de salida</label>
            {scheduleState.loading ? (
              <div className="text-center text-sm text-gray-500">Cargando horarios...</div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                  {scheduleState.schedules.length === 0 ? (
                    <span className="text-sm text-gray-400 self-center">No hay horas de salida configuradas</span>
                  ) : (
                    scheduleState.schedules.map((time) => (
                      <span key={time} className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-mono font-medium text-blue-700 shadow-sm border border-blue-100">
                        {time}
                        <button type="button" onClick={() => scheduleDispatch({ type: "REMOVE_TIME", time })} className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none">
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
                    id="route-schedule-time"
                    value={scheduleState.newTime}
                    onChange={(e) => scheduleDispatch({ type: "SET_NEW_TIME", value: e.target.value })}
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
            <button type="button" onClick={saveEditedSchedule} disabled={scheduleState.submitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{scheduleState.submitting ? "Guardando..." : "Guardar Horarios"}</button>
          </div>

          {(scheduleState.error || scheduleState.loadError) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{scheduleState.error || scheduleState.loadError}</div>
          )}
        </div>
      </div>
    </div>
  );
};
