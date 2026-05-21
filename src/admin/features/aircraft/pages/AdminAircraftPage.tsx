import { useEffect, useState } from "react";
import type {
  AircraftType,
  AircraftStatusAction,
} from "../../../../types/aircraftType";
import { AircraftTable } from "../components/AircraftTable";
import { EditAircraftIdentityModal } from "../components/EditAircraftIdentityModal";
import { EditAircraftCapacityModal } from "../components/EditAircraftCapacityModal";
import {
  getAircrafts,
  updateAircraftCapacity,
  updateAircraftIdentity,
} from "../services/aircraftService";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import {
  ACTION_LABELS,
  STATUS_ACTION_SERVICES,
} from "../constants/aircraft.constants";
import { replaceAircraftInList } from "../utils/aircraft.utils";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import axios from "axios";
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
  const [isEditIdentityOpen, setIsEditIdentityOpen] = useState(false);
  const [isEditCapacityOpen, setIsEditCapacityOpen] = useState(false);

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

  const closeIdentityModal = () => {
    setIsEditIdentityOpen(false);
  };

  const closeCapacityModal = () => {
    setIsEditCapacityOpen(false);
  };

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
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setIdentityError(
          error.response?.data.message ?? "No se pudo actualizar la aeronave.",
        );
      } else {
        setIdentityError("Ha ocurrido un error inesperado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditIdentity = (aircraft: AircraftType) => {
    setSelectedAircraft(aircraft);
    setIsEditIdentityOpen(true);
  };

  const saveEditedIdentity = async (
    id: number,
    producer: string,
    model: string,
  ) => {
    try {
      setIdentitySubmitting(true);
      setIdentityError(null);

      const updatedAircraft = await updateAircraftIdentity(id, {
        producer,
        model,
      });
      setAircrafts((prev) => replaceAircraftInList(prev, updatedAircraft));
      setIsEditIdentityOpen(false);
      setIdentitySubmitting(false);
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setIdentityError(
          error.response?.data.message ?? "No se pudo actualizar la aeronave.",
        );
      } else {
        setIdentityError("Ha ocurrido un error inesperado.");
      }
    } finally {
      setIdentitySubmitting(false);
    }
  };

  const handleEditCapacity = (aircraft: AircraftType) => {
    setSelectedAircraft(aircraft);
    setIsEditCapacityOpen(true);
  };

  const saveEditedCapacity = async (
    id: number,
    economySeats: number,
    firstClassSeats: number,
  ) => {
    try {
      setCapacitySubmitting(true);
      setCapacityError(null);
      const updatedAircraft = await updateAircraftCapacity(id, {
        economySeats,
        firstClassSeats,
      });
      setAircrafts((prev) => replaceAircraftInList(prev, updatedAircraft));
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setCapacityError(
          error.response?.data.message ??
            "No se pudo actualizar la capacidad de la aeronave.",
        );
      } else {
        setCapacityError("Ha ocurrido un error inesperado.");
      }
      console.error("Error updating aircraft capacity:", error);
    } finally {
      setCapacitySubmitting(false);
    }
    setIsEditCapacityOpen(false);
  };

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
      <h1 className="text-2xl font-bold">Aircrafts</h1>
      <div className="mt-4 overflow-x-auto">
        <AircraftTable
          aircrafts={sortedAircrafts}
          onStatusAction={handleStatusAction}
          onEditIdentity={handleEditIdentity}
          onEditCapacity={handleEditCapacity}
        />

        {isEditIdentityOpen && selectedAircraft ? (
          <EditAircraftIdentityModal
            aircraft={selectedAircraft}
            onCancel={closeIdentityModal}
            onSave={saveEditedIdentity}
            isSubmitting={identitySubmitting}
            error={identityError}
          />
        ) : null}

        {isEditCapacityOpen && selectedAircraft ? (
          <EditAircraftCapacityModal
            aircraft={selectedAircraft}
            onCancel={closeCapacityModal}
            onSave={saveEditedCapacity}
            isSubmitting={capacitySubmitting}
            error={capacityError}
          />
        ) : null}

        {isConfirmationOpen && pendingStatusAction ? (
          <ConfirmationModal
            title="Confirmar Acción"
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
