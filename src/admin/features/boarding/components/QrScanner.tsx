import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (token: string) => void;
  onError?: (error: string) => void;
}

const QR_ELEMENT_ID = "admin-qr-reader";

export const QrScanner = ({ onScan, onError }: QrScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const scanningHandledRef = useRef(false);

  const extractToken = useCallback((url: string): string | null => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (/^[0-9a-f-]{36}$/i.test(last)) return last;
      return u.searchParams.get("token") || last;
    } catch {
      if (/^[0-9a-f-]{36}$/i.test(url)) return url;
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        try {
          html5QrRef.current.stop().catch(() => {});
        } catch {
          // element already removed from DOM
        }
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setErrorMsg(null);
      scanningHandledRef.current = false;
      const html5Qr = new Html5Qrcode(QR_ELEMENT_ID);
      html5QrRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          if (scanningHandledRef.current) return;
          const token = extractToken(decodedText);
          if (!token) return;
          scanningHandledRef.current = true;
          try {
            await html5Qr.stop();
            html5QrRef.current = null;
          } catch {
            // scanner already stopped
          }
          setIsScanning(false);
          onScan(token);
        },
        () => {},
      );
      setIsScanning(true);
    } catch {
      const msg = "No se pudo acceder a la cámara. Verifica los permisos.";
      setErrorMsg(msg);
      onError?.(msg);
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
      } catch {
        // scanner stopped
      }
    }
    setIsScanning(false);
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <div
        id={QR_ELEMENT_ID}
        className="bg-black rounded-lg overflow-hidden mx-auto"
        style={{ maxWidth: 400, minHeight: isScanning ? 300 : 100 }}
      />

      <div className="flex justify-center gap-3">
        {!isScanning ? (
          <button
            onClick={startScanner}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium"
          >
            Escanear QR
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
          >
            Detener Cámara
          </button>
        )}
      </div>
    </div>
  );
};
