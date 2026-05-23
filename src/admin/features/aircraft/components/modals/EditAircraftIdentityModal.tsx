import { useState } from "react";
import { AdminModal } from "../../../../components/AdminModal";
import { FormActions } from "../../../../components/FormActions";
import { FormError } from "../../../../components/FormError";
import type { AircraftType } from "../../types/aircraftType";

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
    <AdminModal title="Editar identidad de la aeronave">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fabricante
          </label>
          <input
            type="text"
            value={producer}
            onChange={(e) => setProducer(e.target.value.toUpperCase())}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Modelo
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value.toUpperCase())}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
        <FormError error={error} />
      </form>
    </AdminModal>
  );
};
