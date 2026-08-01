import { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import bgImage from "../../assets/backgrounds/sky-background.png";
import type { ApiErrorResponse } from "../../types/ApiError";
import { LoginBrandPanel } from "../components/LoginBrandPanel";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";
import type { LoginRequestDTO } from "../types/auth";
import { decodeJWT } from "../utils/tokens.utils";
import { AUTH_TOKEN_KEY } from "../constants/auth.constants";

const getDefaultPathForUser = (roles?: string[]): string =>
  roles?.includes("ADMIN") ? "/admin" : "/profile";

export const LoginPage = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const destination = getDefaultPathForUser(user?.roles);
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (credentials: LoginRequestDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await login(credentials);

      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      let userRoles: string[] = [];
      if (token) {
        try {
          const decoded = decodeJWT(token);
          userRoles = decoded.roles;
        } catch {
          // ignore error
        }
      }

      const destination = getDefaultPathForUser(userRoles);
      navigate(destination, { replace: true });
    } catch (unknownError) {
      if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
        setError(
          unknownError.response?.data.message ??
            "No se pudo iniciar sesión. Revisa tus credenciales.",
        );
      } else {
        setError("Ha ocurrido un error inesperado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#071c33] px-4 py-12 sm:px-6 lg:px-8">
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#071c33]/70" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-white/95" />

      <div className="relative z-10 mx-auto grid max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <LoginBrandPanel />

        <div className="flex min-h-[520px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-500">
              Acceso seguro
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#071c33]">
              Bienvenido de nuevo
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Ingresa con tus credenciales para continuar en Falcon Airways.
            </p>
          </div>

          <LoginForm
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
};
