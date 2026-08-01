import { useState } from "react";
import axios from "axios";
import { validateBoardingPass, boardPassengerViaQr } from "../admin/features/boarding/services/boardingService";
import { QrScanner } from "../admin/features/boarding/components/QrScanner";
import type { BoardingPassValidationResponse } from "../admin/features/boarding/types/boardingTypes";
import type { ApiErrorResponse } from "../types/ApiError";
import { AirplaneDepartureIcon } from "../components/icons/AirplaneDepartureIcon";
import { AirplaneArrivalIcon } from "../components/icons/AirplaneArrivalIcon";
import { AirplaneIcon } from "../components/icons/AirplaneIcon";

type View = "scan" | "result";

const statusLabel: Record<string, string> = {
  ISSUED: "Activo",
  BOARDED: "Abordó",
  EXPIRED: "Expirado",
};

const statusColor: Record<string, string> = {
  ISSUED: "bg-green-100 text-green-700",
  BOARDED: "bg-blue-100 text-blue-700",
  EXPIRED: "bg-red-100 text-red-700",
};

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

export const BoardingPage = () => {
  const [view, setView] = useState<View>("scan");
  const [loading, setLoading] = useState(false);
  const [boarding, setBoarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BoardingPassValidationResponse | null>(null);

  const handleScan = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      const result = await validateBoardingPass(token);
      setData(result);
      setView("result");
    } catch (err) {
      setError(getApiErrorMessage(err, "Tarjeta de embarque no encontrada. Verifica el código QR."));
    } finally {
      setLoading(false);
    }
  };

  const handleBoard = async () => {
    if (!data) return;

    try {
      setBoarding(true);
      setError(null);

      await boardPassengerViaQr(data.qrToken);
      const updated = await validateBoardingPass(data.qrToken);
      setData(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo registrar el abordaje."));
    } finally {
      setBoarding(false);
    }
  };

  const handleNewScan = () => {
    setView("scan");
    setData(null);
    setError(null);
  };

  if (view === "result" && data) {
    return (
      <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Tarjeta de embarque</h1>
            <button
              type="button"
              onClick={handleNewScan}
              className="px-4 py-2 text-sm bg-gray-200 rounded-xl hover:bg-gray-300 transition cursor-pointer font-medium"
            >
              Nueva búsqueda
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-black">FALCON AIRWAYS</p>
                <span className={`text-xs px-3 py-1 rounded-full font-medium bg-white ${statusColor[data.status]}`}>
                  {statusLabel[data.status] || data.status}
                </span>
              </div>
              <p className="text-sm text-black/70 mt-1">Pase de abordar</p>
            </div>

            <div className="px-6 py-5">
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Pasajero</p>
                <p className="text-xl font-bold text-gray-800">{data.passengerName}</p>
                <p className="text-sm text-gray-500">ID: {data.identification}</p>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="flex justify-center mb-1 text-gray-400"><AirplaneDepartureIcon /></div>
                    <p className="text-lg font-bold">{data.origin}</p>
                    <p className="text-xs text-gray-500">Origen</p>
                  </div>
                  <div className="flex-1 mx-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">{data.flightNumber}</p>
                    <div className="flex items-center">
                      <div className="h-[2px] bg-gray-300 flex-1" />
                      <span className="mx-2 rotate-45 text-gray-400"><AirplaneIcon /></span>
                      <div className="h-[2px] bg-gray-300 flex-1" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Directo</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-1 text-gray-400"><AirplaneArrivalIcon /></div>
                    <p className="text-lg font-bold">{data.destination}</p>
                    <p className="text-xs text-gray-500">Destino</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Asiento</p>
                  <p className="text-2xl font-bold text-yellow-600">{data.seatLabel}</p>
                  <p className="text-xs text-gray-500">{data.seatClass === "FIRST_CLASS" ? "Primera clase" : "Económico"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Salida</p>
                  <p className="text-lg font-semibold">
                    {new Date(data.departureTime).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(data.departureTime).toLocaleDateString("es-CO")}
                  </p>
                </div>
              </div>
            </div>

            {data.status === "ISSUED" && (
              <div className="px-6 pb-5">
                <button
                  type="button"
                  onClick={handleBoard}
                  disabled={boarding}
                  className={`w-full py-3 rounded-xl font-semibold transition cursor-pointer ${
                    boarding
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {boarding ? "Procesando..." : "Registrar abordaje"}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mt-4">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Abordaje</h1>
          <p className="text-gray-500 mt-2">Escanea el código QR de tu tarjeta de embarque</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <QrScanner onScan={handleScan} onError={(msg) => setError(msg)} />

          {loading && (
            <div className="text-center py-4">
              <p className="text-gray-500">Validando tarjeta de embarque...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mt-4">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
