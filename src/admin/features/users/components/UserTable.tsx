import type { AdminUser } from "../types/userTypes";

interface UserTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onToggleDisabled: (user: AdminUser) => void;
  isSubmitting: boolean;
}

export const UserTable = ({ users, onEdit, onToggleDisabled, isSubmitting }: UserTableProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border text-gray-500">
        No se encontraron usuarios.
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-gray-50 text-left">
          <th className="p-3 font-semibold text-gray-600">ID</th>
          <th className="p-3 font-semibold text-gray-600">Email</th>
          <th className="p-3 font-semibold text-gray-600">Roles</th>
          <th className="p-3 font-semibold text-gray-600">Estado</th>
          <th className="p-3 font-semibold text-gray-600">Pasajero</th>
          <th className="p-3 font-semibold text-gray-600">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b hover:bg-gray-50">
            <td className="p-3">{user.id}</td>
            <td className="p-3">{user.email}</td>
            <td className="p-3">{user.roles.join(", ")}</td>
            <td className="p-3">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.disabled
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {user.disabled ? "Deshabilitado" : "Activo"}
              </span>
            </td>
            <td className="p-3">
              {user.passengerProfile
                ? `${user.passengerProfile.firstName} ${user.passengerProfile.lastName}`
                : "-"}
            </td>
            <td className="p-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(user)}
                  className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-md text-xs font-medium transition-colors"
                >
                  Ver detalle
                </button>
                <button
                  type="button"
                  onClick={() => onToggleDisabled(user)}
                  disabled={isSubmitting}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
                    user.disabled
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {user.disabled ? "Activar" : "Desactivar"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
