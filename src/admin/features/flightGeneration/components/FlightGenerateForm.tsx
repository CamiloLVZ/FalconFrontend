import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { generateFlightsForRoute, generateFlightsForAllRoutes } from "../services/flightGenerationService";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface FlightGenerateFormProps {
  onClose: () => void;
  onGenerated: () => void;
}

export const FlightGenerateForm = ({ onClose, onGenerated }: FlightGenerateFormProps) => {
  const [routeFlightNumber, setRouteFlightNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setActionError(null);
      if (routeFlightNumber.trim()) {
        await generateFlightsForRoute(routeFlightNumber.trim());
      } else {
        await generateFlightsForAllRoutes();
      }
      setRouteFlightNumber("");
      onGenerated();
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "No se pudo iniciar la generación."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {actionError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {actionError}
        </div>
      )}

      <div>
        <label htmlFor="flightgen-route" className="block text-sm font-medium text-gray-700 mb-1">
          Ruta (Opcional)
        </label>
        <input
          type="text"
          id="flightgen-route"
          value={routeFlightNumber}
          onChange={(e) => setRouteFlightNumber(e.target.value)}
          aria-label="Ruta"
          placeholder="Ej. AV123 (Dejar en blanco para todas)"
          className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
        />
        <p className="mt-1 text-xs text-gray-500">
          Si se deja en blanco, se generarán vuelos para todas las rutas activas.
        </p>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Iniciando..." : "Iniciar Generación"}
        </button>
      </div>
    </form>
  );
};
