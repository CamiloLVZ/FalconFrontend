import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { registerAdmin, registerUser } from "../../../../auth/services/authService";
import type { RegisterRequest } from "../../../../auth/types/auth";
import { SuccessMessage } from "../../../components/SuccessMessage";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface UserCreateFormProps {
  onClose: () => void;
  onCreated: () => void;
}

export const UserCreateForm = ({ onClose, onCreated }: UserCreateFormProps) => {
  const [role, setRole] = useState<"CLIENT" | "ADMIN">("CLIENT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        const data: RegisterRequest = { email, password };
        try {
          setSubmitting(true);
          setError(null);
          if (role === "ADMIN") {
            await registerAdmin(data);
          } else {
            await registerUser(data);
          }
          setSuccess("Usuario creado exitosamente.");
          setTimeout(() => { onCreated(); onClose(); }, 1500);
        } catch (err) {
          setError(getApiErrorMessage(err, "No se pudo crear el usuario."));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
        <input name="email" id="email" aria-label="Email" type="email" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña <span className="text-red-500">*</span></label>
        <input name="password" id="password" aria-label="Contraseña" type="password" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="user-role" className="block text-sm font-medium text-gray-700">Tipo de usuario <span className="text-red-500">*</span></label>
        <select
          id="user-role"
          value={role}
          onChange={(e) => setRole(e.target.value as "CLIENT" | "ADMIN")}
          aria-label="Tipo de usuario"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
        >
          <option value="CLIENT">Cliente</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>
      <div className="pt-4 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{submitting ? "Creando..." : "Crear"}</button>
      </div>
      <div className="mt-3">
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
      </div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{error}</div>}
    </form>
  );
};
