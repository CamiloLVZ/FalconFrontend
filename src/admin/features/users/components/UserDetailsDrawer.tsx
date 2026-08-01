import { useState, useEffect } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import type { Reservation } from "../../reservations/types/reservationTypes";
import { getUserReservations, updateUserCredentials, toggleUserDisabled } from "../services/userAdminService";
import type { AdminUser, UpdateUserCredentials } from "../types/userTypes";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface UserDetailsDrawerProps {
  user: AdminUser;
  loading: boolean;
  onUpdated: () => void;
}

export const UserDetailsDrawer = ({ user, loading: pageLoading, onUpdated }: UserDetailsDrawerProps) => {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsPage, setReservationsPage] = useState(0);
  const [reservationsTotalPages, setReservationsTotalPages] = useState(0);
  const [, setReservationsTotalElements] = useState(0);
  const [reservationStatusFilter, setReservationStatusFilter] = useState("");

  const loadUserReservations = async (userId: number, page: number, size: number, status?: string) => {
    try {
      setReservationsLoading(true);
      const data = await getUserReservations(userId, page, size, status);
      setUserReservations(data.content);
      setReservationsPage(data.page);
      setReservationsTotalPages(data.totalPages);
      setReservationsTotalElements(data.totalElements);
    } catch {
      setUserReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    setReservationsLoading(true);
    getUserReservations(user.id, 0, 5).then((data) => {
      if (ignore) return;
      setUserReservations(data.content);
      setReservationsPage(data.page);
      setReservationsTotalPages(data.totalPages);
      setReservationsTotalElements(data.totalElements);
    }).catch(() => {
      if (!ignore) setUserReservations([]);
    }).finally(() => {
      setReservationsLoading(false);
    });
    return () => { ignore = true; };
  }, [user.id]);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() && !newPassword.trim()) {
      setActionError("Debes proporcionar al menos un campo (email o contraseña).");
      return;
    }
    try {
      setIsSubmitting(true);
      setActionError(null);
      const body: UpdateUserCredentials = {};
      if (newEmail.trim()) body.email = newEmail.trim();
      if (newPassword.trim()) body.password = newPassword.trim();
      await updateUserCredentials(user.id, body);
      setNewEmail("");
      setNewPassword("");
      setActionError(null);
      onUpdated();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudieron actualizar las credenciales."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDisabled = async () => {
    const action = user.disabled ? "activar" : "desactivar";
    if (!window.confirm(`¿Estás seguro de que deseas ${action} al usuario ${user.email}?`)) return;
    try {
      await toggleUserDisabled(user.id);
      onUpdated();
    } catch (err) {
      setActionError(getApiErrorMessage(err, `No se pudo ${action} el usuario.`));
    }
  };

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{actionError}</div>
      )}

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Detalles del Usuario</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium">ID</p>
            <p className="text-gray-900">{user.id}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Email</p>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Roles</p>
            <p className="text-gray-900">{user.roles.join(", ")}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Estado</p>
            <p className="text-gray-900">{user.disabled ? "Deshabilitado" : "Activo"}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleToggleDisabled}
            disabled={pageLoading}
            className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
              user.disabled
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {user.disabled ? "Activar Usuario" : "Desactivar Usuario"}
          </button>
        </div>
      </div>

      {user.passengerProfile && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Perfil de Pasajero</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Nombre</p>
              <p className="text-gray-900">{user.passengerProfile.firstName} {user.passengerProfile.lastName}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Identificación</p>
              <p className="text-gray-900">{user.passengerProfile.identificationNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Nacionalidad</p>
              <p className="text-gray-900">{user.passengerProfile.nationalityIsoCode}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Pasaporte</p>
              <p className="text-gray-900">{user.passengerProfile.passportNumber ?? "-"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Actualizar Credenciales</h3>
        <form onSubmit={handleUpdateCredentials} className="space-y-3">
          <div>
            <label htmlFor="drawer-newEmail" className="block text-sm font-medium text-gray-700 mb-1">Nuevo Email</label>
            <input type="email" id="drawer-newEmail" aria-label="Nuevo Email" placeholder="Dejar en blanco para no cambiar" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary text-sm" />
          </div>
          <div>
            <label htmlFor="drawer-newPassword" className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <input type="password" id="drawer-newPassword" aria-label="Nueva Contraseña" placeholder="Dejar en blanco para no cambiar" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary text-sm" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{isSubmitting ? "Guardando..." : "Guardar Cambios"}</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Reservas del Usuario</h3>
        <div className="mb-3">
          <select
            value={reservationStatusFilter}
            onChange={(e) => {
              setReservationStatusFilter(e.target.value);
              loadUserReservations(user.id, 0, 5, e.target.value || undefined);
            }}
            aria-label="Filtrar reservas por estado"
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="RESERVED">RESERVED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>
        {reservationsLoading ? (
          <LoadingScreen />
        ) : userReservations.length === 0 ? (
          <p className="text-sm text-gray-500">No se encontraron reservas.</p>
        ) : (
          <div className="space-y-2">
            {userReservations.map((r) => (
              <div key={r.number} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                <div>
                  <p className="font-medium">{r.number}</p>
                  <p className="text-xs text-gray-500">{r.flight.flightNumber} | {r.status} | {r.passengers.length} pasajero(s)</p>
                </div>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  r.status === "RESERVED" ? "bg-green-100 text-green-800" : r.status === "COMPLETED" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                }`}>{r.status}</span>
              </div>
            ))}
            {reservationsTotalPages > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                <button type="button" disabled={reservationsPage === 0} onClick={() => loadUserReservations(user.id, reservationsPage - 1, 5, reservationStatusFilter || undefined)} className="px-3 py-1 text-xs border rounded-md disabled:opacity-50 hover:bg-gray-50">Anterior</button>
                <span className="px-3 py-1 text-xs text-gray-500">{reservationsPage + 1} / {reservationsTotalPages}</span>
                <button type="button" disabled={reservationsPage >= reservationsTotalPages - 1} onClick={() => loadUserReservations(user.id, reservationsPage + 1, 5, reservationStatusFilter || undefined)} className="px-3 py-1 text-xs border rounded-md disabled:opacity-50 hover:bg-gray-50">Siguiente</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
