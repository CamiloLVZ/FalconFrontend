import { useEffect, useState, useReducer } from "react";
import type { Reducer } from "react";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { AdminDrawer } from "../../../components/AdminDrawer";
import { Pagination } from "../../../components/Pagination";
import { UserTable } from "../components/UserTable";
import {
  getAdminUsers,
  toggleUserDisabled,
} from "../services/userAdminService";
import type { AdminUser } from "../types/userTypes";
import { UserCreateForm } from "../components/UserCreateForm";
import { UserDetailsDrawer } from "../components/UserDetailsDrawer";

interface State {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isCreateDrawerOpen: boolean;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: { users: AdminUser[]; page: number; totalPages: number; totalElements: number } }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" };

const initialState: State = {
  users: [],
  loading: false,
  error: null,
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
  isCreateDrawerOpen: false,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return {
        ...state,
        loading: false,
        users: action.payload.users,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        totalElements: action.payload.totalElements,
      };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.payload, currentPage: 0 };
    case "OPEN_CREATE":
      return { ...state, isCreateDrawerOpen: true };
    case "CLOSE_CREATE":
      return { ...state, isCreateDrawerOpen: false };
    default:
      return state;
  }
};

export const AdminUsersPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { users, loading, error, currentPage, pageSize, totalPages, totalElements, isCreateDrawerOpen } = state;

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [disabledFilter, setDisabledFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadUsers = async (page: number, size: number, email?: string, disabled?: string, role?: string) => {
    try {
      dispatch({ type: "LOAD_START" });
      const disabledBool = disabled === "true" ? true : disabled === "false" ? false : undefined;
      const data = await getAdminUsers(page, size, email || undefined, disabledBool, role || undefined);
      dispatch({
        type: "LOAD_SUCCESS",
        payload: { users: data.content, page: data.page, totalPages: data.totalPages, totalElements: data.totalElements },
      });
    } catch (err) {
      console.error(err);
      dispatch({ type: "LOAD_ERROR", payload: "No se pudieron cargar los usuarios." });
    }
  };

  useEffect(() => {
    let ignore = false;
    dispatch({ type: "LOAD_START" });
    const disabledBool = disabledFilter === "true" ? true : disabledFilter === "false" ? false : undefined;
    getAdminUsers(currentPage, pageSize, emailFilter || undefined, disabledBool, roleFilter || undefined)
      .then((data) => {
        if (!ignore) dispatch({ type: "LOAD_SUCCESS", payload: { users: data.content, page: data.page, totalPages: data.totalPages, totalElements: data.totalElements } });
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          dispatch({ type: "LOAD_ERROR", payload: "No se pudieron cargar los usuarios." });
        }
      });
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadUsers(0, pageSize, emailFilter, disabledFilter, roleFilter);
  };

  const handleClearFilters = () => {
    setEmailFilter("");
    setRoleFilter("");
    setDisabledFilter("");
    dispatch({ type: "SET_PAGE", payload: 0 });
    loadUsers(0, pageSize, "", "", "");
  };

  const handleToggleDisabled = async (user: AdminUser) => {
    const action = user.disabled ? "activar" : "desactivar";
    if (!window.confirm(`¿Estás seguro de que deseas ${action} al usuario ${user.email}?`)) return;
    try {
      dispatch({ type: "LOAD_START" });
      await toggleUserDisabled(user.id);
      loadUsers(currentPage, pageSize, emailFilter, disabledFilter, roleFilter);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
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
            type="button"
            onClick={() => dispatch({ type: "OPEN_CREATE" })}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium"
          >
            + Crear Usuario
          </button>
          <button
            type="button"
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
            aria-label="Email"
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
            aria-label="Rol"
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
            aria-label="Estado"
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">Todos</option>
            <option value="false">Activo</option>
            <option value="true">Deshabilitado</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            Buscar
          </button>
          <button
            type="button"
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
        onPageChange={(page) => dispatch({ type: "SET_PAGE", payload: page })}
        onPageSizeChange={(size) => {
          dispatch({ type: "SET_PAGE_SIZE", payload: size });
        }}
      />

      <AdminDrawer
        title="Crear Usuario"
        isOpen={isCreateDrawerOpen}
        onClose={() => dispatch({ type: "CLOSE_CREATE" })}
      >
        <UserCreateForm
          onClose={() => dispatch({ type: "CLOSE_CREATE" })}
          onCreated={() => loadUsers(currentPage, pageSize, emailFilter, disabledFilter, roleFilter)}
        />
      </AdminDrawer>

      <AdminDrawer
        title={selectedUser ? `Usuario: ${selectedUser.email}` : "Usuario"}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedUser && (
          <UserDetailsDrawer
            user={selectedUser}
            loading={loading}
            onUpdated={() => loadUsers(currentPage, pageSize, emailFilter, disabledFilter, roleFilter)}
          />
        )}
      </AdminDrawer>
    </section>
  );
};
