import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { createRoute } from "../services/routeService";
import type { CreateRouteRequest } from "../types/routeTypes";
import type { Airport } from "../../airports/types/airportTypes";
import type { AirplaneType } from "../../aircraft/types/airplaneTypeTypes";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface RouteCreateFormProps {
  airportsData: Airport[];
  aircraftsData: AirplaneType[];
  onClose: () => void;
  onCreated: () => void;
}

export const RouteCreateForm = ({ airportsData, aircraftsData, onClose, onCreated }: RouteCreateFormProps) => {
  const [formData, setFormData] = useState<CreateRouteRequest>({
    flightNumber: "",
    airportOriginIataCode: "",
    airportDestinationIataCode: "",
    idDefaultAirplaneType: 0,
    durationMinutes: 0,
    basePriceEconomy: 0,
    basePriceFirstClass: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          setSubmitting(true);
          setError(null);
          await createRoute(formData);
          onCreated();
          onClose();
        } catch (err) {
          setError(getApiErrorMessage(err, "No se pudo crear la ruta."));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Número de vuelo <span className="text-red-500">*</span></label>
        <input
          type="text"
          aria-label="Número de vuelo"
          placeholder="Ej: AV5678"
          value={formData.flightNumber}
          onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Aeropuerto de origen <span className="text-red-500">*</span></label>
        <select
          value={formData.airportOriginIataCode}
          onChange={(e) => setFormData({ ...formData, airportOriginIataCode: e.target.value })}
          aria-label="Aeropuerto de origen"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
        >
          <option value="">Seleccionar origen</option>
          {airportsData.map((airport) => (
            <option key={airport.iataCode} value={airport.iataCode}>{airport.iataCode} - {airport.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Aeropuerto de destino <span className="text-red-500">*</span></label>
        <select
          value={formData.airportDestinationIataCode}
          onChange={(e) => setFormData({ ...formData, airportDestinationIataCode: e.target.value })}
          aria-label="Aeropuerto de destino"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
        >
          <option value="">Seleccionar destino</option>
          {airportsData.map((airport) => (
            <option key={airport.iataCode} value={airport.iataCode}>{airport.iataCode} - {airport.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de aeronave <span className="text-red-500">*</span></label>
        <select
          value={formData.idDefaultAirplaneType}
          onChange={(e) => setFormData({ ...formData, idDefaultAirplaneType: parseInt(e.target.value) })}
          aria-label="Tipo de aeronave"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
        >
          <option value={0}>Seleccionar aeronave</option>
          {aircraftsData.reduce<React.ReactNode[]>((acc, aircraft) => {
            if (aircraft.status === "ACTIVE") acc.push(<option key={aircraft.id} value={aircraft.id}>{aircraft.producer} {aircraft.model}</option>);
            return acc;
          }, [])}
            <option key={aircraft.id} value={aircraft.id}>{aircraft.producer} {aircraft.model}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Duración (minutos) <span className="text-red-500">*</span></label>
        <input
          type="number"
          aria-label="Duración (minutos)"
          min={1}
          value={formData.durationMinutes}
          onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Precio base (Economy) <span className="text-red-500">*</span></label>
        <input
          type="number"
          aria-label="Precio base (Economy)"
          step="0.01"
          min={0}
          value={formData.basePriceEconomy}
          onChange={(e) => setFormData({ ...formData, basePriceEconomy: parseFloat(e.target.value) || 0 })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Precio base (First Class) <span className="text-red-500">*</span></label>
        <input
          type="number"
          aria-label="Precio base (First Class)"
          step="0.01"
          min={0}
          value={formData.basePriceFirstClass}
          onChange={(e) => setFormData({ ...formData, basePriceFirstClass: parseFloat(e.target.value) || 0 })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="pt-4 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{submitting ? "Creando..." : "Crear"}</button>
      </div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{error}</div>}
    </form>
  );
};
