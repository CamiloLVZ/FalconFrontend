import { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import bgImage from "../../assets/backgrounds/sky-background.png";
import type { ApiErrorResponse } from "../../types/ApiError";
import { LoginBrandPanel } from "../components/LoginBrandPanel";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import { useAuth } from "../hooks/useAuth";
import { registerUser } from "../services/authService";
import type { LoginRequestDTO, RegisterRequest } from "../types/auth";
import { decodeJWT } from "../utils/tokens.utils";
import { AUTH_TOKEN_KEY } from "../constants/auth.constants";

const getDefaultPathForUser = (roles?: string[]): string =>
  roles?.includes("ADMIN") ? "/admin" : "/profile";

export const LoginPage = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    const destination = getDefaultPathForUser(user?.roles);
    return <Navigate to={destination} replace />;
  }

  const handleLoginSubmit = async (credentials: LoginRequestDTO) => {
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

  const handleRegisterSubmit = async (data: RegisterRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setRegisterSuccess(null);

      await registerUser(data);

      try {
        await login(data);
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
      } catch {
        setRegisterSuccess(
          "¡Registro exitoso! Tu cuenta ha sido creada. Inicia sesión para continuar.",
        );
        setMode("login");
      }
    } catch (unknownError) {
      if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
        setError(
          unknownError.response?.data.message ??
            "No se pudo completar el registro. Intenta nuevamente.",
        );
      } else {
        setError("Ha ocurrido un error inesperado durante el registro.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
    setRegisterSuccess(null);
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
          {/* Mode Navigation Tabs */}
          <div className="mb-6 flex border-b border-slate-200">
            <button
              type="button"
              data-testid="login-tab-button"
              onClick={() => switchMode("login")}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                mode === "login"
                  ? "border-yellow-500 text-[#071c33]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              data-testid="register-tab-button"
              onClick={() => switchMode("register")}
              className={`ml-6 pb-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                mode === "register"
                  ? "border-yellow-500 text-[#071c33]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Registrarse
            </button>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-500">
              Acceso seguro
            </p>
            <h2
              className="mt-3 text-3xl font-bold text-[#071c33]"
              data-testid={mode === "login" ? "login-title" : "register-title"}
            >
              {mode === "login" ? "Bienvenido de nuevo" : "Crear una cuenta"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {mode === "login"
                ? "Ingresa con tus credenciales para continuar en Falcon Airways."
                : "Crea tu cuenta para reservar vuelos y gestionar tus viajes en Falcon Airways."}
            </p>
          </div>

          {mode === "login" ? (
            <>
              <LoginForm
                error={error}
                isSubmitting={isSubmitting}
                onSubmit={handleLoginSubmit}
              />
              <p className="mt-6 text-center text-sm text-slate-500">
                ¿No tienes una cuenta?{" "}
                <button
                  type="button"
                  data-testid="switch-to-register-button"
                  onClick={() => switchMode("register")}
                  className="font-semibold text-[#071c33] hover:text-yellow-600 underline cursor-pointer"
                >
                  Regístrate aquí
                </button>
              </p>
            </>
          ) : (
            <>
              <RegisterForm
                error={error}
                success={registerSuccess}
                isSubmitting={isSubmitting}
                onSubmit={handleRegisterSubmit}
              />
              <p className="mt-6 text-center text-sm text-slate-500">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  data-testid="switch-to-login-button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-[#071c33] hover:text-yellow-600 underline cursor-pointer"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
