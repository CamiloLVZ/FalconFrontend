import { useEffect, useState } from "react";
import { AdminModal } from "../../../../components/AdminModal";
import { FormActions } from "../../../../components/FormActions";
import { FormError } from "../../../../components/FormError";
import type { ResponseRoute } from "../../types/routeTypes";
import { getAllAirports } from "../../../airports/services/airportService";
import { getAircrafts } from "../../../aircraft/services/aircraftService";
import type { Airport } from "../../../airports/types/AirportTypes";
import type { AircraftType } from "../../../aircraft/types/aircraftTypes";

interface EditRouteModalProps {
  route: ResponseRoute;
  onSave: (
    flightNumber: string,
    originIata: string,
    destinationIata: string,
    aircraftId: number,
    duration: number,
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export const EditRouteModal = ({
  route,
  onSave,
  onCancel,
  isSubmitting,
  error,
}: EditRouteModalProps) => {
  const [originIata, setOriginIata] = useState(route.airportOrigin.iataCode);
  const [destinationIata, setDestinationIata] = useState(
    route.airportDestination.iataCode,
  );
  const [aircraftId, setAircraftId] = useState(route.defaultAirplaneType.id);
  const [duration, setDuration] = useState(route.lengthMinutes);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [aircrafts, setAircrafts] = useState<AircraftType[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [airportsData, aircraftsData] = await Promise.all([
          getAllAirports(1000, 0),
          getAircrafts(),
        ]);
        setAirports(airportsData.content);
        setAircrafts(aircraftsData);
      } catch {
        setLoadError("Error al cargar datos");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      route.flightNumber,
      originIata,
      destinationIata,
      aircraftId,
      duration,
    );
  };

  const activeAircrafts = aircrafts.filter((a) => a.status === "ACTIVE");

  return (
    <AdminModal title="Editar ruta">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número de vuelo
          </label>
          <input
            type="text"
            value={route.flightNumber}
            disabled
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-500 shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            El número de vuelo no puede modificarse
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Aeropuerto de origen
          </label>
          <select
            value={originIata}
            onChange={(e) => setOriginIata(e.target.value)}
            disabled={loadingData}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Seleccionar origen</option>
            {airports.map((airport) => (
              <option key={airport.iataCode} value={airport.iataCode}>
                {airport.iataCode} - {airport.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Aeropuerto de destino
          </label>
          <select
            value={destinationIata}
            onChange={(e) => setDestinationIata(e.target.value)}
            disabled={loadingData}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Seleccionar destino</option>
            {airports.map((airport) => (
              <option key={airport.iataCode} value={airport.iataCode}>
                {airport.iataCode} - {airport.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de aeronave (activas)
          </label>
          <select
            value={aircraftId}
            onChange={(e) => setAircraftId(parseInt(e.target.value))}
            disabled={loadingData}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Seleccionar aeronave</option>
            {activeAircrafts.map((aircraft) => (
              <option key={aircraft.id} value={aircraft.id}>
                {aircraft.producer} {aircraft.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duración del vuelo (minutos)
          </label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <FormActions
          isSubmitting={isSubmitting || loadingData}
          onCancel={onCancel}
        />
        <FormError error={error || loadError} />
      </form>
    </AdminModal>
  );
};
