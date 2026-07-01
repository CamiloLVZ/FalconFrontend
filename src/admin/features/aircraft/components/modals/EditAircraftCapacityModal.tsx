import { useState } from "react";
import { AdminModal } from "../../../../components/AdminModal";
import { FormActions } from "../../../../components/FormActions";
import { FormError } from "../../../../components/FormError";
import type { AircraftType } from "../../types/aircraftTypes";

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
}: EditAircraftCapacityModalProps) => {
  const [economySeats, setEconomySeats] = useState(aircraft.economySeats);
  const [firstClassSeats, setFirstClassSeats] = useState(
    aircraft.firstClassSeats,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(aircraft.id, economySeats, firstClassSeats);
  };

  return (
    <AdminModal title="Editar capacidad de la aeronave">
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
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Asientos primera clase
          </label>
          <input
            type="number"
            value={firstClassSeats}
            onChange={(e) => setFirstClassSeats(parseInt(e.target.value) || 0)}
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
