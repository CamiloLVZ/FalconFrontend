import type { FormEvent } from "react";
import { useState } from "react";
import type { RegisterRequest } from "../types/auth";

interface RegisterFormProps {
  error: string | null;
  success: string | null;
  isSubmitting: boolean;
  onSubmit: (data: RegisterRequest) => Promise<void>;
}

export const RegisterForm = ({
  error,
  success,
  isSubmitting,
  onSubmit,
}: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError("Las contraseñas no coinciden.");
      return;
    }

    await onSubmit({ email, password });
  };

  const activeError = validationError || error;

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="register-email"
          className="block text-sm font-semibold text-slate-700"
        >
          Correo electrónico
        </label>
        <input
          id="register-email"
          type="email"
          data-testid="register-email-input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40"
          placeholder="johndoe@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="block text-sm font-semibold text-slate-700"
        >
          Contraseña
        </label>
        <div className="relative mt-2">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            className="block w-full rounded-lg border border-slate-300 bg-white pl-4 pr-12 py-3 text-slate-900 shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40"
            data-testid="register-password-input"
            placeholder="Crea tu contraseña"
          />
          <button
            type="button"
            data-testid="register-toggle-password-button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 012.122-.063c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.115-3.876a3 3 0 11-4.243-4.243M3 3l18 18"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="register-confirm-password"
          className="block text-sm font-semibold text-slate-700"
        >
          Confirmar contraseña
        </label>
        <div className="relative mt-2">
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            className="block w-full rounded-lg border border-slate-300 bg-white pl-4 pr-12 py-3 text-slate-900 shadow-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40"
            data-testid="register-confirm-password-input"
            placeholder="Repite tu contraseña"
          />
          <button
            type="button"
            data-testid="register-toggle-confirm-password-button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            aria-label={
              showConfirmPassword
                ? "Ocultar confirmación de contraseña"
                : "Mostrar confirmación de contraseña"
            }
          >
            {showConfirmPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 012.122-.063c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.115-3.876a3 3 0 11-4.243-4.243M3 3l18 18"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {activeError ? (
        <div
          data-testid="register-error-label"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {activeError}
        </div>
      ) : null}

      {success ? (
        <div
          data-testid="register-success-label"
          className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      ) : null}

      <button
        data-testid="register-button"
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-yellow-400 px-5 py-3 text-base font-bold text-[#071c33] shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        {isSubmitting ? "Registrando..." : "Crear cuenta"}
      </button>
    </form>
  );
};
