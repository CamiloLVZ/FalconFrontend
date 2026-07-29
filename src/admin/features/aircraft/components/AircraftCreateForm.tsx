import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { createAircraft } from "../services/aircraftService";
import type { CreateAirplaneTypeRequest } from "../types/airplaneTypeTypes";
import { SuccessMessage } from "../../../components/SuccessMessage";

interface AircraftCreateFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

export const AircraftCreateForm = ({ onSuccess, onClose }: AircraftCreateFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const firstClassVal = (form.elements.namedItem("firstClassSeats") as HTMLInputElement).value;
    const data: CreateAirplaneTypeRequest = {
      producer: (form.elements.namedItem("producer") as HTMLInputElement).value.toUpperCase(),
      model: (form.elements.namedItem("model") as HTMLInputElement).value.toUpperCase(),
      economySeats: parseInt((form.elements.namedItem("economySeats") as HTMLInputElement).value),
      firstClassSeats: firstClassVal ? parseInt(firstClassVal) : undefined,
      seatColumns: (form.elements.namedItem("seatColumns") as HTMLInputElement).value.toUpperCase(),
    };
    try {
      setSubmitting(true);
      setError(null);
      await createAircraft(data);
      setSuccess("Aeronave creada exitosamente.");
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo crear la aeronave."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fabricante <span className="text-red-500">*</span></label>
        <input name="producer" aria-label="Fabricante" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Modelo <span className="text-red-500">*</span></label>
        <input name="model" aria-label="Modelo" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Asientos clase económica <span className="text-red-500">*</span></label>
        <input name="economySeats" aria-label="Asientos clase económica" type="number" min={1} required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Asientos primera clase</label>
        <input name="firstClassSeats" aria-label="Asientos primera clase" type="number" min={0} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Columnas de asientos <span className="text-red-500">*</span></label>
        <input name="seatColumns" aria-label="Columnas de asientos" required pattern="[A-Z]+" title="Solo letras mayúsculas, sin repetir" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
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
