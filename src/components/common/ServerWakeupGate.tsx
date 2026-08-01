import { useState, useEffect, useRef, type ReactNode } from "react";
import imgLogo from "../../assets/logo/logo.png";

const HEALTH_ENDPOINT = `${import.meta.env.VITE_API_URL}/v1/health`;
const SHOW_DELAY_MS = 400;
const RETRY_INTERVAL_MS = 4000;
const MAX_WAIT_MS = 420_000;
const SESSION_KEY = "serverAwake";
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface ServerWakeupGateProps {
  children: ReactNode;
}

type Status = "checking" | "ready" | "error";

interface HealthPollCallbacks {
  onReady: () => void;
  onError: () => void;
}

const startHealthPolling = (callbacks: HealthPollCallbacks): (() => void) => {
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const startTime = Date.now();

  const attempt = async (): Promise<void> => {
    while (!cancelled) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= MAX_WAIT_MS) {
        if (!cancelled) callbacks.onError();
        return;
      }

      try {
        const controller = new AbortController();
        const abortTimer = setTimeout(() => controller.abort(), 10_000);
        timers.push(abortTimer);

        const res = await fetch(HEALTH_ENDPOINT, {
          signal: controller.signal,
        });
        clearTimeout(abortTimer);

        if (res.ok) {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({ at: Date.now() }));
          if (!cancelled) callbacks.onReady();
          return;
        }
      } catch {
        // server not ready yet, retry
      }

      await new Promise((resolve) => {
        timers.push(setTimeout(resolve, RETRY_INTERVAL_MS));
      });
    }
  };

  attempt();

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
};

export const ServerWakeupGate = ({ children }: ServerWakeupGateProps) => {
  const [status, setStatus] = useState<Status>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return "checking";
      const parsed = JSON.parse(raw);
      if (parsed?.at && Date.now() - parsed.at < SESSION_TTL_MS) {
        return "ready";
      }
    } catch {
      // corrupted or unparseable → treat as unconfirmed
    }
    return "checking";
  });
  const [showLoader, setShowLoader] = useState(false);

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // react-doctor-disable-next-line no-fetch-in-effect – intentional server health polling on mount/retry; fetching lives in module-level startHealthPolling with AbortController + cancellation guards
  useEffect(() => {
    if (status === "ready") return;

    showTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setShowLoader(true);
    }, SHOW_DELAY_MS);

    const stopPolling = startHealthPolling({
      onReady: () => {
        if (mountedRef.current) setStatus("ready");
      },
      onError: () => {
        if (mountedRef.current) setStatus("error");
      },
    });

    return () => {
      mountedRef.current = false;
      stopPolling();
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [status]);

  if (status === "ready") return <>{children}</>;

  if (status === "error") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
        <img
          src={imgLogo}
          alt="Falcon logo"
          className="mb-6 h-20 w-auto rounded-xl"
        />
        <p className="text-xl font-semibold text-gray-700 mb-2">
          El servidor no está disponible
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Puede que el servidor esté iniciando o haya fallado. Intenta de nuevo.
        </p>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(SESSION_KEY);
            setStatus("checking");
            setShowLoader(false);
            mountedRef.current = true;
          }}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
          <div className="relative w-32 h-32 mb-6">
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
          <p className="text-lg font-semibold text-gray-700 mb-1">
            Preparando servidor, por favor espere
          </p>
          <p className="text-sm text-gray-400">
            Esto puede tardar unos minutos la primera vez
          </p>
          <style>{`
            @keyframes fillAnimation {
              0%, 100% { opacity: 0.1; transform: scaleY(1); }
              50% { opacity: 0.4; transform: scaleY(1.1); }
            }
          `}</style>
        </div>
      )}
      {children}
    </>
  );
};
