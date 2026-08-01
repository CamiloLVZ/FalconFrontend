import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { createRoute } from "../services/routeService";
import type { CreateRouteRequest } from "../types/routeTypes";
import type { AirportOption, AirplaneTypeOption } from "../../../../services/catalogService";
import { SuccessMessage } from "../../../components/SuccessMessage";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface RouteCreateFormProps {
  airportsData: AirportOption[];
  aircraftsData: AirplaneTypeOption[];
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
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          setSubmitting(true);
          setError(null);
          await createRoute(formData);
          setSuccess("Ruta creada exitosamente.");
          setTimeout(() => { onCreated(); onClose(); }, 1500);
        } catch (err) {
          setError(getApiErrorMessage(err, "No se pudo crear la ruta."));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div>
        <label htmlFor="route-flightNumber" className="block text-sm font-medium text-gray-700">Número de vuelo <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="route-flightNumber"
          aria-label="Número de vuelo"
          placeholder="Ej: AV5678"
          value={formData.flightNumber}
          onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="route-airportOriginIataCode" className="block text-sm font-medium text-gray-700">Aeropuerto de origen <span className="text-red-500">*</span></label>
        <select
          id="route-airportOriginIataCode"
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
        <label htmlFor="route-airportDestinationIataCode" className="block text-sm font-medium text-gray-700">Aeropuerto de destino <span className="text-red-500">*</span></label>
        <select
          id="route-airportDestinationIataCode"
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
        <label htmlFor="route-idDefaultAirplaneType" className="block text-sm font-medium text-gray-700">Tipo de aeronave <span className="text-red-500">*</span></label>
        <select
          id="route-idDefaultAirplaneType"
          value={formData.idDefaultAirplaneType}
          onChange={(e) => setFormData({ ...formData, idDefaultAirplaneType: parseInt(e.target.value) })}
          aria-label="Tipo de aeronave"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
        >
          <option value={0}>Seleccionar aeronave</option>
          {aircraftsData.map((aircraft) => (
            <option key={aircraft.id} value={aircraft.id}>{aircraft.producer} {aircraft.model}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="route-durationMinutes" className="block text-sm font-medium text-gray-700">Duración (minutos) <span className="text-red-500">*</span></label>
        <input
          type="number"
          id="route-durationMinutes"
          aria-label="Duración (minutos)"
          min={1}
          value={formData.durationMinutes}
          onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="route-basePriceEconomy" className="block text-sm font-medium text-gray-700">Precio base (Economy) <span className="text-red-500">*</span></label>
        <input
          type="number"
          id="route-basePriceEconomy"
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
        <label htmlFor="route-basePriceFirstClass" className="block text-sm font-medium text-gray-700">Precio base (First Class) <span className="text-red-500">*</span></label>
        <input
          type="number"
          id="route-basePriceFirstClass"
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
      <div className="mt-3">
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
      </div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{error}</div>}
    </form>
  );
};
