import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { rescheduleFlight, changeAirplaneType, cancelFlight } from "../services/flightAdminService";
import type { ResponseFlightDto } from "../types/flightTypes";
import { SuccessMessage } from "../../../components/SuccessMessage";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface FlightEditFormProps {
  flight: ResponseFlightDto;
  onUpdated: () => void;
}

export const FlightEditForm = ({ flight, onUpdated }: FlightEditFormProps) => {
  const [departureDate, setDepartureDate] = useState(() => flight.departureDateTime.substring(0, 16));
  const [airplaneTypeId, setAirplaneTypeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleReschedule = async () => {
    if (!departureDate) return;
    try {
      setIsSubmitting(true);
      setActionError(null);
      const localDateTime = new Date(departureDate).toISOString().slice(0, 19);
      await rescheduleFlight(flight.id, localDateTime);
      setSuccess("Vuelo reprogramado exitosamente.");
      setActionError(null);
      onUpdated();
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "No se pudo reprogramar el vuelo."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeAirplane = async () => {
    if (!airplaneTypeId) return;
    try {
      setIsSubmitting(true);
      setActionError(null);
      await changeAirplaneType(flight.id, parseInt(airplaneTypeId, 10));
      setSuccess("Aeronave asignada exitosamente.");
      setActionError(null);
      onUpdated();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo cambiar el avión."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelFlight = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas cancelar el vuelo ${flight.flightNumber}?`)) return;
    try {
      setIsSubmitting(true);
      setActionError(null);
      await cancelFlight(flight.id);
      setSuccess(`Vuelo ${flight.flightNumber} cancelado.`);
      setActionError(null);
      onUpdated();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo cancelar el vuelo."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
      {actionError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {actionError}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">
          Reprogramar Salida
        </h3>
        <div className="space-y-3">
          <input
            type="datetime-local"
            aria-label="Reprogramar Salida"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
          />
          <button
            type="button"
            onClick={handleReschedule}
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
          >
            Confirmar Nueva Fecha
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-3">
          Cambiar Aeronave
        </h3>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="ID del Tipo de Aeronave"
            value={airplaneTypeId}
            onChange={(e) => setAirplaneTypeId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
          />
          <button
            type="button"
            onClick={handleChangeAirplane}
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
          >
            Asignar Aeronave
          </button>
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="font-semibold text-red-800 mb-2">
          Zona de Peligro
        </h3>
        <p className="text-xs text-red-600 mb-3">
          La cancelación de un vuelo es irreversible y afectará a los pasajeros.
        </p>
        <button
          type="button"
          onClick={handleCancelFlight}
          disabled={isSubmitting || flight.status === "CANCELLED" || flight.status === "CANCELED"}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50"
        >
          Cancelar Vuelo
        </button>
      </div>
    </div>
  );
};
