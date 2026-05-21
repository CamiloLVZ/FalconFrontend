import { useState } from "react";
import type { AircraftType } from "../../../../types/aircraftType";

interface EditAircraftIdentityModalProps {
  aircraft: AircraftType;
  onSave: (id: number, producer: string, model: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export const EditAircraftIdentityModal = ({
  aircraft,
  onSave,
  onCancel,
  isSubmitting,
  error,
}: EditAircraftIdentityModalProps) => {
  const [producer, setProducer] = useState(aircraft.producer);
  const [model, setModel] = useState(aircraft.model);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(aircraft.id, producer, model);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-96 rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">
          Editar identidad de la Aeronave
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Producer
            </label>
            <input
              type="text"
              value={producer}
              onChange={(e) => setProducer(e.target.value.toUpperCase())}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value.toUpperCase())}
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
