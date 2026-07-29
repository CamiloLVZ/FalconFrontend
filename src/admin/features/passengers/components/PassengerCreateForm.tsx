import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { createPassenger } from "../services/passengerService";
import type { CreatePassengerRequest } from "../types/passengerTypes";
import { SuccessMessage } from "../../../components/SuccessMessage";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface PassengerCreateFormProps {
  onClose: () => void;
  onCreated: () => void;
}

export const PassengerCreateForm = ({ onClose, onCreated }: PassengerCreateFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data: CreatePassengerRequest = {
          firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value,
          lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
          gender: (form.elements.namedItem("gender") as HTMLSelectElement).value as "M" | "F" | "O",
          nationalityIsoCode: (form.elements.namedItem("nationality") as HTMLInputElement).value.toUpperCase(),
          dateOfBirth: (form.elements.namedItem("dateOfBirth") as HTMLInputElement).value,
          identificationNumber: (form.elements.namedItem("identificationNumber") as HTMLInputElement).value,
          passportNumber: (form.elements.namedItem("passportNumber") as HTMLInputElement).value || undefined,
        };
        try {
          setSubmitting(true);
          setError(null);
          await createPassenger(data);
          setSuccess("Pasajero creado exitosamente.");
          setTimeout(() => { onCreated(); onClose(); }, 1500);
        } catch (err) {
          setError(getApiErrorMessage(err, "No se pudo crear el pasajero."));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
        <input name="firstName" aria-label="Nombre" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Apellido <span className="text-red-500">*</span></label>
        <input name="lastName" aria-label="Apellido" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Género <span className="text-red-500">*</span></label>
        <select name="gender" aria-label="Género" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm">
          <option value="">Seleccionar</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
          <option value="O">Otro</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nacionalidad (ISO) <span className="text-red-500">*</span></label>
        <input name="nationality" aria-label="Nacionalidad (ISO)" placeholder="Ej: CO" maxLength={2} required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento <span className="text-red-500">*</span></label>
        <input name="dateOfBirth" aria-label="Fecha de nacimiento" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Número de identificación <span className="text-red-500">*</span></label>
        <input name="identificationNumber" aria-label="Número de identificación" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Número de pasaporte</label>
        <input name="passportNumber" aria-label="Número de pasaporte" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
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
