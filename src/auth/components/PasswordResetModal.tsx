import { useEffect, useReducer } from "react";
import type { Reducer } from "react";
import axios from "axios";
import { requestPasswordReset, resetPassword } from "../services/authService";
import type { ApiErrorResponse } from "../../types/ApiError";

interface PasswordResetModalProps {
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
}

type ResetStep = "email" | "code" | "password" | "success";

const CODE_EXPIRATION_SECONDS = 300; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60; // 1 minute

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface FormState {
  step: ResetStep;
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  error: string | null;
  isSubmitting: boolean;
}

type FormField = "email" | "code" | "newPassword" | "confirmPassword";

type FormAction =
  | { type: "SET_FIELD"; field: FormField; value: string }
  | { type: "SET_STEP"; step: ResetStep }
  | { type: "SET_ERROR"; message: string | null }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "TOGGLE_SHOW_PASSWORD" }
  | { type: "RESET_FORM" };

const formReducer: Reducer<FormState, FormAction> = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_ERROR":
      return { ...state, error: action.message };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.value };
    case "TOGGLE_SHOW_PASSWORD":
      return { ...state, showPassword: !state.showPassword };
    case "RESET_FORM":
      return { ...state, step: "email", code: "", newPassword: "", confirmPassword: "", showPassword: false, error: null, isSubmitting: false };
  }
};

interface TimerState {
  timer: number;
  resendCooldown: number;
}

type TimerAction = { type: "TICK" } | { type: "RESET_TIMERS" };

const timerReducer: Reducer<TimerState, TimerAction> = (state, action) => {
  switch (action.type) {
    case "TICK":
      return { timer: Math.max(0, state.timer - 1), resendCooldown: Math.max(0, state.resendCooldown - 1) };
    case "RESET_TIMERS":
      return { timer: CODE_EXPIRATION_SECONDS, resendCooldown: RESEND_COOLDOWN_SECONDS };
  }
};

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
    <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <span>{message}</span>
  </div>
);

interface ResetEmailStepProps {
  email: string;
  error: string | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ResetEmailStep = ({ email, error, isSubmitting, onEmailChange, onSubmit }: ResetEmailStepProps) => (
  <div>
    <div className="text-center mb-6">
      <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#071c33]">¿Olvidaste tu contraseña?</h3>
      <p className="text-xs text-slate-500 mt-1">
        Ingresa tu correo electrónico registrado y te enviaremos un código de verificación de 6 dígitos.
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          id="reset-email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="usuario@falcon.com"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
        />
      </div>

      {error && <ErrorBanner message={error} />}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-[#071c33] font-bold rounded-xl shadow transition cursor-pointer disabled:opacity-60"
      >
        {isSubmitting ? "Enviando..." : "Continuar"}
      </button>
    </form>
  </div>
);

interface ResetCodeStepProps {
  email: string;
  code: string;
  timer: number;
  resendCooldown: number;
  error: string | null;
  isSubmitting: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onResend: () => void;
}

const ResetCodeStep = ({ email, code, timer, resendCooldown, error, isSubmitting, onCodeChange, onSubmit, onBack, onResend }: ResetCodeStepProps) => (
  <div>
    <div className="text-center mb-6">
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#071c33]">Ingresa el código</h3>
      <p className="text-xs text-slate-500 mt-1">
        Enviamos un código de 6 dígitos a <span className="font-semibold text-slate-800">{email}</span>
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="reset-code" className="block text-xs font-semibold text-slate-700 mb-2 text-center">
          Código de verificación (6 dígitos)
        </label>
        <input
          type="text"
          id="reset-code"
          maxLength={6}
          required
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="w-full text-center text-2xl font-mono tracking-[0.5em] px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
        />
      </div>

      {/* Expiration Timer & Resend */}
      <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
        <span className="text-slate-500 font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timer > 0 ? (
            <>Expira en: <span className="font-mono font-bold text-blue-600">{formatTime(timer)}</span></>
          ) : (
            <span className="text-red-600 font-bold">Código expirado</span>
          )}
        </span>

        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0 || isSubmitting}
          className="font-bold text-yellow-600 hover:text-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : "Reenviar código"}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
        >
          Atrás
        </button>
        <button
          type="submit"
          className="w-2/3 py-3 bg-yellow-400 hover:bg-yellow-300 text-[#071c33] font-bold rounded-xl shadow transition cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </form>
  </div>
);

interface ResetPasswordStepProps {
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  error: string | null;
  isSubmitting: boolean;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const ResetPasswordStep = ({ newPassword, confirmPassword, showPassword, error, isSubmitting, onNewPasswordChange, onConfirmPasswordChange, onToggleShowPassword, onSubmit, onBack }: ResetPasswordStepProps) => (
  <div>
    <div className="text-center mb-6">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#071c33]">Nueva contraseña</h3>
      <p className="text-xs text-slate-500 mt-1">
        Ingresa tu nueva contraseña dos veces para confirmar.
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="reset-newPassword" className="block text-xs font-semibold text-slate-700 mb-1">
          Nueva contraseña *
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="reset-newPassword"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none pr-10"
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.04 10.04 0 012.122-.063c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.115-3.876a3 3 0 11-4.243-4.243M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="reset-confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1">
          Confirmar nueva contraseña *
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="reset-confirmPassword"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          placeholder="Repite la nueva contraseña"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
        />
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-2/3 py-3 bg-yellow-400 hover:bg-yellow-300 text-[#071c33] font-bold rounded-xl shadow transition cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? "Restableciendo..." : "Confirmar cambio"}
        </button>
      </div>
    </form>
  </div>
);

const ResetSuccessStep = ({ onClose }: { onClose: () => void }) => (
  <div className="text-center py-4 space-y-4">
    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-slate-900">¡Contraseña Restablecida!</h3>
    <p className="text-sm text-slate-500">
      Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión con tu nueva contraseña.
    </p>
    <button
      type="button"
      onClick={onClose}
      className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-[#071c33] font-bold rounded-xl shadow transition cursor-pointer mt-4"
    >
      Ir a Iniciar Sesión
    </button>
  </div>
);

export const PasswordResetModal = ({
  isOpen,
  initialEmail = "",
  onClose,
}: PasswordResetModalProps) => {
  const [form, dispatch] = useReducer(formReducer, {
    step: "email",
    email: initialEmail,
    code: "",
    newPassword: "",
    confirmPassword: "",
    showPassword: false,
    error: null,
    isSubmitting: false,
  });
  const [timers, timerDispatch] = useReducer(timerReducer, {
    timer: CODE_EXPIRATION_SECONDS,
    resendCooldown: RESEND_COOLDOWN_SECONDS,
  });

  useEffect(() => {
    if (initialEmail) {
      dispatch({ type: "SET_FIELD", field: "email", value: initialEmail });
    }
  }, [initialEmail]);

  // Countdown timers for code expiration and resend button
  useEffect(() => {
    if (form.step !== "code" && form.step !== "password") return;

    const interval = setInterval(() => {
      timerDispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [form.step]);

  if (!isOpen) return null;

  // Step 1: Request code by Email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) return;

    try {
      dispatch({ type: "SET_SUBMITTING", value: true });
      dispatch({ type: "SET_ERROR", message: null });
      await requestPasswordReset(form.email.trim());
      timerDispatch({ type: "RESET_TIMERS" });
      dispatch({ type: "SET_STEP", step: "code" });
    } catch (err) {
      dispatch({ type: "SET_ERROR", message: getErrorMessage(err, "No se pudo enviar el código de verificación.") });
    } finally {
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  // Resend code
  const handleResendCode = async () => {
    if (timers.resendCooldown > 0 || form.isSubmitting) return;

    try {
      dispatch({ type: "SET_SUBMITTING", value: true });
      dispatch({ type: "SET_ERROR", message: null });
      await requestPasswordReset(form.email.trim());
      timerDispatch({ type: "RESET_TIMERS" });
    } catch (err) {
      dispatch({ type: "SET_ERROR", message: getErrorMessage(err, "No se pudo reenviar el código.") });
    } finally {
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  // Step 2: Validate code format (6 digits) and move to new password step
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.code.trim().length !== 6 || !/^\d{6}$/.test(form.code.trim())) {
      dispatch({ type: "SET_ERROR", message: "El código debe contener exactamente 6 dígitos numéricos." });
      return;
    }
    dispatch({ type: "SET_ERROR", message: null });
    dispatch({ type: "SET_STEP", step: "password" });
  };

  // Step 3: Submit new password with code to backend
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      dispatch({ type: "SET_ERROR", message: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      dispatch({ type: "SET_ERROR", message: "Las contraseñas no coinciden." });
      return;
    }

    try {
      dispatch({ type: "SET_SUBMITTING", value: true });
      dispatch({ type: "SET_ERROR", message: null });
      await resetPassword(form.code.trim(), form.newPassword);
      dispatch({ type: "SET_STEP", step: "success" });
    } catch (err) {
      dispatch({ type: "SET_ERROR", message: getErrorMessage(err, "Código inválido, expirado o error al restablecer la contraseña.") });
    } finally {
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  const handleClose = () => {
    dispatch({ type: "RESET_FORM" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 relative space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          ✕
        </button>

        {form.step === "email" && (
          <ResetEmailStep
            email={form.email}
            error={form.error}
            isSubmitting={form.isSubmitting}
            onEmailChange={(value) => dispatch({ type: "SET_FIELD", field: "email", value })}
            onSubmit={handleSendCode}
          />
        )}

        {form.step === "code" && (
          <ResetCodeStep
            email={form.email}
            code={form.code}
            timer={timers.timer}
            resendCooldown={timers.resendCooldown}
            error={form.error}
            isSubmitting={form.isSubmitting}
            onCodeChange={(value) => dispatch({ type: "SET_FIELD", field: "code", value })}
            onSubmit={handleVerifyCode}
            onBack={() => dispatch({ type: "SET_STEP", step: "email" })}
            onResend={handleResendCode}
          />
        )}

        {form.step === "password" && (
          <ResetPasswordStep
            newPassword={form.newPassword}
            confirmPassword={form.confirmPassword}
            showPassword={form.showPassword}
            error={form.error}
            isSubmitting={form.isSubmitting}
            onNewPasswordChange={(value) => dispatch({ type: "SET_FIELD", field: "newPassword", value })}
            onConfirmPasswordChange={(value) => dispatch({ type: "SET_FIELD", field: "confirmPassword", value })}
            onToggleShowPassword={() => dispatch({ type: "TOGGLE_SHOW_PASSWORD" })}
            onSubmit={handleResetPassword}
            onBack={() => dispatch({ type: "SET_STEP", step: "code" })}
          />
        )}

        {form.step === "success" && <ResetSuccessStep onClose={handleClose} />}
      </div>
    </div>
  );
};
