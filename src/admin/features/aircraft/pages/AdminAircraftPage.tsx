import { useEffect, useReducer } from "react";
import type { Reducer } from "react";
import axios from "axios";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { AdminDrawer } from "../../../components/AdminDrawer";
import { AircraftTable } from "../components/AircraftTable";
import { AircraftEditForm } from "../components/AircraftEditForm";
import { AircraftCreateForm } from "../components/AircraftCreateForm";
import { ACTION_LABELS } from "../constants/aircraft.constants";
import { getAircrafts } from "../services/aircraftService";
import { STATUS_ACTION_SERVICES } from "../services/aircraftStatusActions";
import type {
  AircraftStatusAction,
  AirplaneType,
} from "../types/airplaneTypeTypes";
import { replaceAircraftInList } from "../utils/aircraft.utils";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface State {
  aircrafts: AirplaneType[];
  loading: boolean;
  error: string | null;
  selectedAircraft: AirplaneType | null;
  isEditDrawerOpen: boolean;
  isCreateDrawerOpen: boolean;
  isSubmitting: boolean;
  actionError: string | null;
  pendingStatusAction: { aircraft: AirplaneType; action: AircraftStatusAction } | null;
}

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_AIRCRAFTS"; payload: AirplaneType[] }
  | { type: "UPDATE_AIRCRAFTS"; payload: (prev: AirplaneType[]) => AirplaneType[] }
  | { type: "SET_SELECTED_AIRCRAFT"; payload: AirplaneType | null }
  | { type: "SET_EDIT_DRAWER"; payload: boolean }
  | { type: "SET_CREATE_DRAWER"; payload: boolean }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_ACTION_ERROR"; payload: string | null }
  | { type: "SET_PENDING_ACTION"; payload: { aircraft: AirplaneType; action: AircraftStatusAction } | null };

const reducer: Reducer<State, Action> = (state, action): State => {
  switch (action.type) {
    case "SET_LOADING": return { ...state, loading: action.payload };
    case "SET_ERROR": return { ...state, error: action.payload };
    case "SET_AIRCRAFTS": return { ...state, aircrafts: action.payload };
    case "UPDATE_AIRCRAFTS": return { ...state, aircrafts: action.payload(state.aircrafts) };
    case "SET_SELECTED_AIRCRAFT": return { ...state, selectedAircraft: action.payload };
    case "SET_EDIT_DRAWER": return { ...state, isEditDrawerOpen: action.payload };
    case "SET_CREATE_DRAWER": return { ...state, isCreateDrawerOpen: action.payload };
    case "SET_SUBMITTING": return { ...state, isSubmitting: action.payload };
    case "SET_ACTION_ERROR": return { ...state, actionError: action.payload };
    case "SET_PENDING_ACTION": return { ...state, pendingStatusAction: action.payload };
    default: return state;
  }
};

const initialState: State = {
  aircrafts: [],
  loading: false,
  error: null,
  selectedAircraft: null,
  isEditDrawerOpen: false,
  isCreateDrawerOpen: false,
  isSubmitting: false,
  actionError: null,
  pendingStatusAction: null,
};

export const AdminAircraftPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { aircrafts, loading, error, selectedAircraft, isEditDrawerOpen, isCreateDrawerOpen, isSubmitting, actionError, pendingStatusAction } = state;
  const sortedAircrafts = aircrafts.toSorted((a, b) => a.id - b.id);

  const loadAircrafts = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await getAircrafts();
      dispatch({ type: "SET_AIRCRAFTS", payload: data });
    } catch (error) {
      console.error(error);
      dispatch({ type: "SET_ERROR", payload: "No se han podido cargar las aeronaves. Por favor, inténtalo de nuevo más tarde." });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    loadAircrafts();
  }, []);

  const handleStatusAction = (id: number, action: AircraftStatusAction) => {
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_ACTION_ERROR", payload: null });
    const aircraft = aircrafts.find((a) => a.id === id);
    if (aircraft) {
      dispatch({ type: "SET_PENDING_ACTION", payload: { aircraft, action } });
    }
  };

  const executePendingAction = async () => {
    if (!pendingStatusAction) return;
    const { aircraft, action } = pendingStatusAction;
    const updateService = STATUS_ACTION_SERVICES[action];
    dispatch({ type: "SET_SUBMITTING", payload: true });
    dispatch({ type: "SET_ACTION_ERROR", payload: null });
    try {
      const updatedAircraft = await updateService(aircraft.id);
      dispatch({ type: "UPDATE_AIRCRAFTS", payload: (prev) => replaceAircraftInList(prev, updatedAircraft) });
      dispatch({ type: "SET_PENDING_ACTION", payload: null });
    } catch (error) {
      dispatch({ type: "SET_ACTION_ERROR", payload: getApiErrorMessage(error, "No se pudo actualizar la aeronave.") });
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen messageTitle="Error al cargar aeronaves" message={error} />;
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aeronaves</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => dispatch({ type: "SET_CREATE_DRAWER", payload: true })} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium">
            + Crear Aeronave
          </button>
          <button type="button" onClick={loadAircrafts} disabled={loading} title="Refrescar" className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <AircraftTable
          aircrafts={sortedAircrafts}
          onStatusAction={handleStatusAction}
          onEdit={(a) => {
            dispatch({ type: "SET_SELECTED_AIRCRAFT", payload: a });
            dispatch({ type: "SET_EDIT_DRAWER", payload: true });
          }}
        />

        <AdminDrawer
          title={selectedAircraft ? `Editar ${selectedAircraft.producer} ${selectedAircraft.model}` : "Editar aeronave"}
          isOpen={isEditDrawerOpen}
          onClose={() => dispatch({ type: "SET_EDIT_DRAWER", payload: false })}
        >
          {selectedAircraft && (
            <AircraftEditForm
              aircraft={selectedAircraft}
              onClose={() => dispatch({ type: "SET_EDIT_DRAWER", payload: false })}
              onAircraftsUpdate={(updater) => dispatch({ type: "UPDATE_AIRCRAFTS", payload: updater })}
            />
          )}
        </AdminDrawer>

        <AdminDrawer
          title="Crear Aeronave"
          isOpen={isCreateDrawerOpen}
          onClose={() => dispatch({ type: "SET_CREATE_DRAWER", payload: false })}
        >
          <AircraftCreateForm
            onSuccess={loadAircrafts}
            onClose={() => dispatch({ type: "SET_CREATE_DRAWER", payload: false })}
          />
        </AdminDrawer>

        {pendingStatusAction && (
          <ConfirmationModal
            title="Confirmar acción"
            message={`¿Desea ${ACTION_LABELS[pendingStatusAction.action].toLowerCase()} la aeronave ${pendingStatusAction.aircraft.producer} ${pendingStatusAction.aircraft.model}?`}
            onConfirm={executePendingAction}
            onCancel={() => dispatch({ type: "SET_PENDING_ACTION", payload: null })}
            error={actionError}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </section>
  );
};
