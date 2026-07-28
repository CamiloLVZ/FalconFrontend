import { useEffect, useState } from "react";
import axios from "axios";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { AdminDrawer } from "../../../components/AdminDrawer";
import { Pagination } from "../../../components/Pagination";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import type { Reservation } from "../../reservations/types/reservationTypes";
import { UserTable } from "../components/UserTable";
import {
  getAdminUsers,
  getUserReservations,
  updateUserCredentials,
  toggleUserDisabled,
} from "../services/userAdminService";
import type { AdminUser, UpdateUserCredentials } from "../types/userTypes";
import { registerAdmin, registerUser } from "../../../../auth/services/authService";
import type { RegisterRequest } from "../../../../auth/types/auth";

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [disabledFilter, setDisabledFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createUserRole, setCreateUserRole] = useState<"CLIENT" | "ADMIN">("CLIENT");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsPage, setReservationsPage] = useState(0);
  const [reservationsTotalPages, setReservationsTotalPages] = useState(0);
  const [, setReservationsTotalElements] = useState(0);
  const [reservationStatusFilter, setReservationStatusFilter] = useState("");

  const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return unknownError.response?.data.message ?? fallback;
    }
    return "Ha ocurrido un error inesperado.";
  };

  const loadUsers = async (
    page: number,
    size: number,
    email?: string,
    disabled?: string,
    role?: string,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const disabledBool =
        disabled === "true" ? true : disabled === "false" ? false : undefined;
      const data = await getAdminUsers(
        page,
        size,
        email || undefined,
        disabledBool,
        role || undefined,
      );
      setUsers(data.content);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPage, pageSize, emailFilter, disabledFilter, roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(0);
    loadUsers(0, pageSize, emailFilter, disabledFilter, roleFilter);
  };

  const handleClearFilters = () => {
    setEmailFilter("");
    setRoleFilter("");
    setDisabledFilter("");
    setCurrentPage(0);
    loadUsers(0, pageSize, "", "", "");
  };

  const loadUserReservations = async (
    userId: number,
    page: number,
    size: number,
    status?: string,
  ) => {
    try {
      setReservationsLoading(true);
      const data = await getUserReservations(userId, page, size, status);
      setUserReservations(data.content);
      setReservationsPage(data.page);
      setReservationsTotalPages(data.totalPages);
      setReservationsTotalElements(data.totalElements);
    } catch (err) {
      console.error(err);
      setUserReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  };

  const handleToggleDisabled = async (user: AdminUser) => {
    const action = user.disabled ? "activar" : "desactivar";
    if (
      !window.confirm(
        `¿Estás seguro de que deseas ${action} al usuario ${user.email}?`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setActionError(null);
      await toggleUserDisabled(user.id);
      loadUsers(currentPage, pageSize, emailFilter, disabledFilter, roleFilter);
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, `No se pudo ${action} el usuario.`),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: AdminUser) => {
    setSelectedUser(user);
    setNewEmail("");
    setNewPassword("");
    setActionError(null);
    setReservationStatusFilter("");
    setUserReservations([]);
    setIsDrawerOpen(true);
    loadUserReservations(user.id, 0, 5);
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
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
      await updateUserCredentials(selectedUser.id, body);
      setNewEmail("");
      setNewPassword("");
      setActionError(null);
      loadUsers(currentPage, pageSize, emailFilter, disabledFilter, roleFilter);
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "No se pudieron actualizar las credenciales."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReservationsPageChange = (page: number) => {
    if (!selectedUser) return;
    loadUserReservations(selectedUser.id, page, 5, reservationStatusFilter || undefined);
  };

  if (error) {
    return <ErrorScreen messageTitle="Error" message={error} />;
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCreateError(null);
              setCreateUserRole("CLIENT");
              setIsCreateDrawerOpen(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium"
          >
            + Crear Usuario
          </button>
          <button
            onClick={() => loadUsers(currentPage, pageSize, emailFilter, disabledFilter, roleFilter)}
            disabled={loading}
            title="Refrescar"
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="text"
            placeholder="Filtrar por email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-sm font-medium text-gray-700">Rol</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">Todos</option>
            <option value="CLIENT">CLIENT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-sm font-medium text-gray-700">Estado</label>
          <select
            value={disabledFilter}
            onChange={(e) => setDisabledFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">Todos</option>
            <option value="false">Activo</option>
            <option value="true">Deshabilitado</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            Buscar
          </button>
          <button
            onClick={handleClearFilters}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : (
          <UserTable
            users={users}
            onEdit={handleEditClick}
            onToggleDisabled={handleToggleDisabled}
            isSubmitting={loading}
          />
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(0);
        }}
      />

      <AdminDrawer
        title="Crear Usuario"
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const email = (form.elements.namedItem("email") as HTMLInputElement).value;
            const password = (form.elements.namedItem("password") as HTMLInputElement).value;
            const data: RegisterRequest = { email, password };
            try {
              setCreateSubmitting(true);
              setCreateError(null);
              if (createUserRole === "ADMIN") {
                await registerAdmin(data);
              } else {
                await registerUser(data);
              }
              setIsCreateDrawerOpen(false);
              loadUsers(currentPage, pageSize, emailFilter, disabledFilter, roleFilter);
            } catch (err) {
              setCreateError(getApiErrorMessage(err, "No se pudo crear el usuario."));
            } finally {
              setCreateSubmitting(false);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
            <input name="email" type="email" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña <span className="text-red-500">*</span></label>
            <input name="password" type="password" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de usuario <span className="text-red-500">*</span></label>
            <select
              value={createUserRole}
              onChange={(e) => setCreateUserRole(e.target.value as "CLIENT" | "ADMIN")}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
            >
              <option value="CLIENT">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsCreateDrawerOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
            <button type="submit" disabled={createSubmitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{createSubmitting ? "Creando..." : "Crear"}</button>
          </div>
          {createError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{createError}</div>}
        </form>
      </AdminDrawer>

      <AdminDrawer
        title={
          selectedUser
            ? `Usuario: ${selectedUser.email}`
            : "Usuario"
        }
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedUser && (
          <div className="space-y-6">
            {actionError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {actionError}
              </div>
            )}

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                Detalles del Usuario
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">ID</p>
                  <p className="text-gray-900">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Roles</p>
                  <p className="text-gray-900">{selectedUser.roles.join(", ")}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Estado</p>
                  <p className="text-gray-900">
                    {selectedUser.disabled ? "Deshabilitado" : "Activo"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleToggleDisabled(selectedUser);
                  }}
                  disabled={loading}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                    selectedUser.disabled
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {selectedUser.disabled ? "Activar Usuario" : "Desactivar Usuario"}
                </button>
              </div>
            </div>

            {selectedUser.passengerProfile && (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                  Perfil de Pasajero
                </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Nombre</p>
                    <p className="text-gray-900">
                      {selectedUser.passengerProfile.firstName} {selectedUser.passengerProfile.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Identificación</p>
                    <p className="text-gray-900">
                      {selectedUser.passengerProfile.identificationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Nacionalidad</p>
                    <p className="text-gray-900">
                      {selectedUser.passengerProfile.nationalityIsoCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Pasaporte</p>
                    <p className="text-gray-900">
                      {selectedUser.passengerProfile.passportNumber ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                Actualizar Credenciales
              </h3>
              <form onSubmit={handleUpdateCredentials} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nuevo Email
                  </label>
                  <input
                    type="email"
                    placeholder="Dejar en blanco para no cambiar"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Dejar en blanco para no cambiar"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </form>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                Reservas del Usuario
              </h3>
              <div className="mb-3">
                <select
                  value={reservationStatusFilter}
                  onChange={(e) => {
                    setReservationStatusFilter(e.target.value);
                    loadUserReservations(selectedUser.id, 0, 5, e.target.value || undefined);
                  }}
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
                    <div
                      key={r.number}
                      className="flex items-center justify-between text-sm border-b border-gray-100 pb-2"
                    >
                      <div>
                        <p className="font-medium">{r.number}</p>
                        <p className="text-xs text-gray-500">
                          {r.flight.flightNumber} | {r.status} | {r.passengers.length} pasajero(s)
                        </p>
                      </div>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.status === "RESERVED"
                            ? "bg-green-100 text-green-800"
                            : r.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                  {reservationsTotalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-2">
                      <button
                        disabled={reservationsPage === 0}
                        onClick={() => handleReservationsPageChange(reservationsPage - 1)}
                        className="px-3 py-1 text-xs border rounded-md disabled:opacity-50 hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-1 text-xs text-gray-500">
                        {reservationsPage + 1} / {reservationsTotalPages}
                      </span>
                      <button
                        disabled={reservationsPage >= reservationsTotalPages - 1}
                        onClick={() => handleReservationsPageChange(reservationsPage + 1)}
                        className="px-3 py-1 text-xs border rounded-md disabled:opacity-50 hover:bg-gray-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminDrawer>
    </section>
  );
};
