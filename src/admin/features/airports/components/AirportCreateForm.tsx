import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { createAirport } from "../services/airportService";
import type { CreateAirportData } from "../services/airportService";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface AirportCreateFormProps {
  onClose: () => void;
  onCreated: () => void;
}

export const AirportCreateForm = ({ onClose, onCreated }: AirportCreateFormProps) => {
  const [data, setData] = useState<CreateAirportData>({
    iataCode: "",
    name: "",
    city: "",
    countryIsoCode: "",
    timezone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          setSubmitting(true);
          setError(null);
          await createAirport(data);
          onCreated();
          onClose();
        } catch (err) {
          setError(
            getApiErrorMessage(err, "No se pudo crear el aeropuerto."),
          );
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código IATA <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          aria-label="Código IATA"
          maxLength={3}
          required
          placeholder="Ej: CTG"
          value={data.iataCode}
          onChange={(e) =>
            setData({ ...data, iataCode: e.target.value.toUpperCase() })
          }
          className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary uppercase"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          aria-label="Nombre"
          maxLength={150}
          required
          placeholder="Ej: Aeropuerto Internacional Rafael Núñez"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ciudad <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          aria-label="Ciudad"
          maxLength={150}
          required
          placeholder="Ej: Cartagena"
          value={data.city}
          onChange={(e) => setData({ ...data, city: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          País (ISO) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          aria-label="País (ISO)"
          maxLength={2}
          required
          placeholder="Ej: CO"
          value={data.countryIsoCode}
          onChange={(e) =>
            setData({ ...data, countryIsoCode: e.target.value.toUpperCase() })
          }
          className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary uppercase"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zona Horaria <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          aria-label="Zona Horaria"
          maxLength={20}
          required
          placeholder="Ej: America/Bogota"
          value={data.timezone}
          onChange={(e) => setData({ ...data, timezone: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
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
          {submitting ? "Creando..." : "Crear Aeropuerto"}
        </button>
      </div>
    </form>
  );
};
