import { useEffect, useRef, useState } from "react";
import imgLogo from "../../assets/logo/logo.png";

const API_BASE = import.meta.env.VITE_API_URL;
const HEALTH_URL = `${API_BASE}/v1/health`;
const SESSION_KEY = "serverAwake";

const CHECK_TIMEOUT = 10_000;
const RETRY_INTERVAL = 5_000;
const MAX_RETRIES = 84;
const SHOW_LOADER_DELAY = 400;

type Status = "checking" | "ready" | "error";

interface ServerWakeupGateProps {
  children: React.ReactNode;
}

export const ServerWakeupGate = ({ children }: ServerWakeupGateProps) => {
  const [status, setStatus] = useState<Status>(
    sessionStorage.getItem(SESSION_KEY) === "true" ? "ready" : "checking",
  );
  const [showLoader, setShowLoader] = useState(false);

  const retryRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cleanup = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  useEffect(() => {
    if (status !== "checking") return;

    const showTimer = setTimeout(() => setShowLoader(true), SHOW_LOADER_DELAY);

    const attempt = async (): Promise<void> => {
      cleanup();

      const controller = new AbortController();
      abortRef.current = controller;

      const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT);

      try {
        const res = await fetch(HEALTH_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          cleanup();
          sessionStorage.setItem(SESSION_KEY, "true");
          setStatus("ready");
          return;
        }

        throw new Error(`Health check failed: ${res.status}`);
      } catch {
        clearTimeout(timeoutId);
        retryRef.current++;

        if (retryRef.current >= MAX_RETRIES) {
          setStatus("error");
          return;
        }

        timerRef.current = setTimeout(attempt, RETRY_INTERVAL);
      }
    };

    attempt();

    return () => {
      clearTimeout(showTimer);
      cleanup();
    };
  }, [status]);

  const handleRetry = () => {
    retryRef.current = 0;
    setShowLoader(false);
    setStatus("checking");
  };

  if (status === "ready") return <>{children}</>;

  if (status === "error") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-6 px-6">
        <div className="relative">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12 text-red-600"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>
        </div>
        <div className="text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            No se pudo conectar con el servidor
          </h2>
          <p className="text-gray-500 max-w-md">
            El servidor no responde después de varios intentos. Verifica tu
            conexión o inténtalo de nuevo.
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Reintentar
        </button>
        <div className="flex gap-2 mt-4">
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    );
  }

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-6">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-24 h-24 overflow-hidden rounded-xl">
            <img
              src={imgLogo}
              alt="Falcon logo"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-blue-600 opacity-30 animate-pulse"
              style={{
                animation: "fillAnimation 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          <p className="text-lg font-semibold text-gray-700">
            Preparando servidor, por favor espere
          </p>
          <div className="flex gap-1">
            <span
              className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <span
              className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Esto puede tardar unos minutos la primera vez
        </p>
      </div>

      <style>{`
        @keyframes fillAnimation {
          0%, 100% { opacity: 0.1; transform: scaleY(1); }
          50% { opacity: 0.4; transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
};
