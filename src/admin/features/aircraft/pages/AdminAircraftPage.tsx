import { useEffect, useState } from "react";
import axios from "axios";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { AdminDrawer } from "../../../components/AdminDrawer";
import { AircraftTable } from "../components/AircraftTable";
import { ACTION_LABELS } from "../constants/aircraft.constants";
import {
  getAircrafts,
  updateAircraftCapacity,
  updateAircraftIdentity,
} from "../services/aircraftService";
import { STATUS_ACTION_SERVICES } from "../services/aircraftStatusActions";
import type {
  AircraftStatusAction,
  AircraftType,
} from "../types/aircraftTypes";
import { replaceAircraftInList } from "../utils/aircraft.utils";

export const AdminAircraftPage = () => {
  const [aircrafts, setAircrafts] = useState<AircraftType[]>([]);
  const sortedAircrafts = [...aircrafts].sort((a, b) => a.id - b.id);
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftType | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [identitySubmitting, setIdentitySubmitting] = useState(false);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [capacitySubmitting, setCapacitySubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingStatusAction, setPendingStatusAction] = useState<{
    aircraft: AircraftType;
    action: AircraftStatusAction;
  } | null>(null);
  const isConfirmationOpen = pendingStatusAction !== null;
  const [isIdentityDrawerOpen, setIsIdentityDrawerOpen] = useState(false);

  const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return unknownError.response?.data.message ?? fallback;
    }

    return "Ha ocurrido un error inesperado.";
  };

  const loadAircrafts = async () => {
    try {
      setLoading(true);
      const data = await getAircrafts();
      setAircrafts(data);
    } catch (error) {
      console.error(error);
      setError(
        "No se han podido cargar las aeronaves. Por favor, inténtalo de nuevo más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAircrafts();
  }, []);

  // Drawer close handler is implemented inline where needed.

  const closeConfirmationModal = () => {
    setPendingStatusAction(null);
  };

  const handleStatusAction = (id: number, action: AircraftStatusAction) => {
    setError(null);
    setActionError(null);
    const aircraft = aircrafts.find((a) => a.id === id);

    if (!aircraft) return;

    setPendingStatusAction({
      aircraft,
      action,
    });
  };

  const executePendingAction = async () => {
    if (!pendingStatusAction) return;

    const { aircraft, action } = pendingStatusAction;
    const updateService = STATUS_ACTION_SERVICES[action];

    try {
      setIsSubmitting(true);
      setActionError(null);

      const updatedAircraft = await updateService(aircraft.id);

      setAircrafts((prev) => replaceAircraftInList(prev, updatedAircraft));
      setPendingStatusAction(null);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "No se pudo actualizar la aeronave."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unified edit flow uses a single drawer and combined save logic in the form submit handler.

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <ErrorScreen messageTitle="Error al cargar aeronaves" message={error} />
    );
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <h1 className="text-2xl font-bold">Aeronaves</h1>
      <div className="mt-4 overflow-x-auto">
        <AircraftTable
          aircrafts={sortedAircrafts}
          onStatusAction={handleStatusAction}
          onEdit={(a) => {
            setSelectedAircraft(a);
            setIdentityError(null);
            setCapacityError(null);
            setIsIdentityDrawerOpen(true);
          }}
        />

        <AdminDrawer
          title={
            selectedAircraft
              ? `Editar ${selectedAircraft.producer} ${selectedAircraft.model}`
              : "Editar aeronave"
          }
          isOpen={isIdentityDrawerOpen}
          onClose={() => setIsIdentityDrawerOpen(false)}
        >
          {selectedAircraft && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const producer = (
                  form.elements.namedItem("producer") as HTMLInputElement
                ).value.toUpperCase();
                const model = (
                  form.elements.namedItem("model") as HTMLInputElement
                ).value.toUpperCase();
                const economySeats = parseInt(
                  (form.elements.namedItem("economySeats") as HTMLInputElement)
                    .value,
                );
                const firstClassSeats = parseInt(
                  (
                    form.elements.namedItem(
                      "firstClassSeats",
                    ) as HTMLInputElement
                  ).value,
                );

                // Call both services in sequence
                (async () => {
                  try {
                    setIdentitySubmitting(true);
                    setCapacitySubmitting(true);
                    setIdentityError(null);
                    setCapacityError(null);

                    const updatedIdentity = await updateAircraftIdentity(
                      selectedAircraft.id,
                      { producer, model },
                    );
                    setAircrafts((prev) =>
                      replaceAircraftInList(prev, updatedIdentity),
                    );

                    const updatedCapacity = await updateAircraftCapacity(
                      selectedAircraft.id,
                      { economySeats, firstClassSeats },
                    );
                    setAircrafts((prev) =>
                      replaceAircraftInList(prev, updatedCapacity),
                    );

                    setIsIdentityDrawerOpen(false);
                  } catch (err) {
                    const msg = getApiErrorMessage(
                      err,
                      "No se pudo actualizar la aeronave.",
                    );
                    setIdentityError(msg);
                    setCapacityError(msg);
                  } finally {
                    setIdentitySubmitting(false);
                    setCapacitySubmitting(false);
                  }
                })();
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fabricante
                </label>
                <input
                  name="producer"
                  defaultValue={selectedAircraft.producer}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Modelo
                </label>
                <input
                  name="model"
                  defaultValue={selectedAircraft.model}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Asientos clase económica
                </label>
                <input
                  name="economySeats"
                  type="number"
                  min={1}
                  defaultValue={selectedAircraft.economySeats}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Asientos primera clase
                </label>
                <input
                  name="firstClassSeats"
                  type="number"
                  defaultValue={selectedAircraft.firstClassSeats}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsIdentityDrawerOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={identitySubmitting || capacitySubmitting}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {identitySubmitting || capacitySubmitting
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>

              {(identityError || capacityError) && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">
                  {identityError || capacityError}
                </div>
              )}
            </form>
          )}
        </AdminDrawer>

        {isConfirmationOpen && pendingStatusAction ? (
          <ConfirmationModal
            title="Confirmar acción"
            message={`¿Desea ${ACTION_LABELS[pendingStatusAction.action].toLowerCase()} la aeronave ${pendingStatusAction.aircraft.producer} ${pendingStatusAction.aircraft.model}?`}
            onConfirm={executePendingAction}
            onCancel={closeConfirmationModal}
            error={actionError}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </div>
    </section>
  );
};
