import { useState } from "react";
import type { AircraftType } from "../../../../types/aircraftType";

interface EditAircraftCapacityModalProps {
  aircraft: AircraftType;
  onSave: (id: number, economySeats: number, firstClassSeats: number) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export const EditAircraftCapacityModal = ({
  aircraft,
  onSave,
  onCancel,
  isSubmitting,
  error,
}: EditAircraftCapacityModalProps & {
  isSubmitting: boolean;
  error: string | null;
}) => {
  const [economySeats, setEconomySeats] = useState(aircraft.economySeats);
  const [firstClassSeats, setFirstClassSeats] = useState(
    aircraft.firstClassSeats,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(aircraft.id, economySeats, firstClassSeats);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-96 rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">
          Editar capacidad de la Aeronave
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Asientos clase económica
            </label>
            <input
              type="number"
              min={1}
              value={economySeats}
              onChange={(e) => setEconomySeats(parseInt(e.target.value) || 1)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Asientos primera clase
            </label>
            <input
              type="number"
              value={firstClassSeats}
              onChange={(e) =>
                setFirstClassSeats(parseInt(e.target.value) || 0)
              }
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <input
              type="submit"
              value={isSubmitting ? "Guardando..." : "Guardar"}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            />
            <input
              type="button"
              value="Cancelar"
              className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
              onClick={onCancel}
            />
          </div>
          {error && (
            <div className="mt-4 rounded-md bg-red-100 border border-red-300 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
