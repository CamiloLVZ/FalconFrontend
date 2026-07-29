import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { createCountry } from "../services/airportService";
import type { CreateCountryData } from "../services/airportService";
import { SuccessMessage } from "../../../components/SuccessMessage";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface CountryCreateFormProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CountryCreateForm = ({ onClose, onCreated }: CountryCreateFormProps) => {
  const [data, setData] = useState<CreateCountryData>({ name: "", isoCode: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          setSubmitting(true);
          setError(null);
          await createCountry(data);
          setSuccess("País creado exitosamente.");
          setTimeout(() => { onCreated(); onClose(); }, 1500);
        } catch (err) {
          setError(getApiErrorMessage(err, "No se pudo crear el país."));
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          aria-label="Nombre"
          maxLength={100}
          required
          placeholder="Ej: Colombia"
          value={data.name}
          onChange={(e) =>
            setData({ ...data, name: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código ISO <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          aria-label="Código ISO"
          maxLength={2}
          required
          placeholder="Ej: CO"
          value={data.isoCode}
          onChange={(e) =>
            setData({ ...data, isoCode: e.target.value.toUpperCase() })
          }
          className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary uppercase"
        />
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
          disabled={submitting}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
        >
          {submitting ? "Creando..." : "Crear País"}
        </button>
      </div>
    </form>
  );
};
