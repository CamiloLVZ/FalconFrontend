import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { createFlight } from "../services/flightAdminService";
import type { CreateFlightDto } from "../types/flightTypes";
import { SuccessMessage } from "../../../components/SuccessMessage";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface FlightCreateFormProps {
  onClose: () => void;
  onCreated: () => void;
}

export const FlightCreateForm = ({ onClose, onCreated }: FlightCreateFormProps) => {
  const [routeNumber, setRouteNumber] = useState("");
  const [departure, setDeparture] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!routeNumber.trim() || !departure) return;
        try {
          setSubmitting(true);
          setError(null);
          const localDateTime = new Date(departure).toISOString().slice(0, 19);
          const dto: CreateFlightDto = {
            routeFlightNumber: routeNumber.trim().toUpperCase(),
            departureDateTime: localDateTime,
          };
          await createFlight(dto);
          setSuccess("Vuelo creado exitosamente.");
          setTimeout(() => { onCreated(); onClose(); }, 1500);
        } catch (err) {
          setError(getApiErrorMessage(err, "No se pudo crear el vuelo."));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Número de Ruta <span className="text-red-500">*</span></label>
        <input
          type="text"
          aria-label="Número de Ruta"
          placeholder="Ej: AV1234"
          value={routeNumber}
          onChange={(e) => setRouteNumber(e.target.value.toUpperCase())}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha y hora de salida <span className="text-red-500">*</span></label>
        <input
          type="datetime-local"
          aria-label="Fecha y hora de salida"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="pt-4 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{submitting ? "Creando..." : "Crear"}</button>
      </div>
      <div className="mt-3">
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
      </div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{error}</div>}
    </form>
  );
};
