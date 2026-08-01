import { useState, useReducer } from "react";
import type { Reducer } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { validateBoardingPass, boardPassengerViaQr } from "../services/boardingService";
import type { BoardingPassValidationResponse } from "../types/boardingTypes";
import { QrScanner } from "../components/QrScanner";

const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
    return unknownError.response?.data.message ?? fallback;
  }
  return "Ha ocurrido un error inesperado.";
};

interface ValidationState {
  loading: boolean;
  error: string | null;
  boardingPass: BoardingPassValidationResponse | null;
}

interface ActionState {
  isSubmitting: boolean;
  actionError: string | null;
  successMsg: string | null;
}

type ValidationAction =
  | { type: "VALIDATE_START" }
  | { type: "VALIDATE_SUCCESS"; payload: BoardingPassValidationResponse }
  | { type: "VALIDATE_ERROR"; payload: string }
  | { type: "BOARD_PASS" };

const validationReducer: Reducer<ValidationState, ValidationAction> = (state, action): ValidationState => {
  switch (action.type) {
    case "VALIDATE_START": return { loading: true, error: null, boardingPass: null };
    case "VALIDATE_SUCCESS": return { loading: false, error: null, boardingPass: action.payload };
    case "VALIDATE_ERROR": return { loading: false, error: action.payload, boardingPass: null };
    case "BOARD_PASS": return state.boardingPass ? { ...state, boardingPass: { ...state.boardingPass, status: "BOARDED" as const } } : state;
  }
};

type ActionAction =
  | { type: "BOARD_START" }
  | { type: "BOARD_SUCCESS" }
  | { type: "BOARD_ERROR"; payload: string };

const actionReducer: Reducer<ActionState, ActionAction> = (_state, action): ActionState => {
  switch (action.type) {
    case "BOARD_START": return { isSubmitting: true, actionError: null, successMsg: null };
    case "BOARD_SUCCESS": return { isSubmitting: false, actionError: null, successMsg: "Pasajero abordado exitosamente." };
    case "BOARD_ERROR": return { isSubmitting: false, actionError: action.payload, successMsg: null };
  }
};

const extractToken = (value: string): string => {
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (/^[0-9a-f-]{36}$/i.test(last)) return last;
    return url.searchParams.get("token") || last;
  } catch {
    return trimmed;
  }
};

export const AdminBoardingPage = () => {
  const [qrInput, setQrInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [vState, vDispatch] = useReducer(validationReducer, { loading: false, error: null, boardingPass: null });
  const [aState, aDispatch] = useReducer(actionReducer, { isSubmitting: false, actionError: null, successMsg: null });
  const { loading, error, boardingPass } = vState;
  const { isSubmitting, actionError, successMsg } = aState;

  const handleValidate = async (token: string) => {
    vDispatch({ type: "VALIDATE_START" });
    try {
      const result = await validateBoardingPass(token);
      vDispatch({ type: "VALIDATE_SUCCESS", payload: result });
    } catch (err) {
      vDispatch({ type: "VALIDATE_ERROR", payload: getApiErrorMessage(err, "No se pudo validar el boarding pass.") });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    const token = extractToken(qrInput);
    await handleValidate(token);
  };

  const handleQrScan = (token: string) => {
    setQrInput(token);
    setShowScanner(false);
    handleValidate(token);
  };

  const handleBoard = async () => {
    if (!boardingPass) return;
    aDispatch({ type: "BOARD_START" });
    try {
      await boardPassengerViaQr(boardingPass.qrToken);
      aDispatch({ type: "BOARD_SUCCESS" });
      vDispatch({ type: "BOARD_PASS" });
    } catch (err) {
      aDispatch({ type: "BOARD_ERROR", payload: getApiErrorMessage(err, "No se pudo realizar el abordaje.") });
    }
  };

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Validar Boarding Pass</h1>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setShowScanner(!showScanner)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              showScanner
                ? "bg-primary text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showScanner ? "Escanear QR" : "Escanear con Cámara"}
          </button>
        </div>

        {showScanner && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <QrScanner onScan={handleQrScan} onError={(msg) => vDispatch({ type: "VALIDATE_ERROR", payload: msg })} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="boarding-token" className="block text-sm font-medium text-gray-700 mb-1">
              Token o Enlace del Boarding Pass
            </label>
            <input
              type="text"
              id="boarding-token"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              aria-label="Token o Enlace del Boarding Pass"
              placeholder="Pega el enlace o token QR aquí"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !qrInput.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Validando..." : "Validar"}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {successMsg}
        </div>
      )}

      {boardingPass && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Boarding Pass Encontrado
            </h2>
          </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Pasajero</p>
              <p className="text-gray-900 font-semibold">{boardingPass.passengerName}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Identificación</p>
              <p className="text-gray-900">{boardingPass.identification}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Vuelo</p>
              <p className="text-gray-900">{boardingPass.flightNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Ruta</p>
              <p className="text-gray-900">{boardingPass.origin} → {boardingPass.destination}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Salida</p>
              <p className="text-gray-900">
                {new Date(boardingPass.departureTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Asiento</p>
              <p className="text-gray-900">
                {boardingPass.seatLabel} ({boardingPass.seatClass === "FIRST_CLASS" ? "Primera Clase" : "Económico"})
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Estado</p>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  boardingPass.status === "ISSUED"
                    ? "bg-green-100 text-green-800"
                    : boardingPass.status === "BOARDED"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {boardingPass.status === "ISSUED" ? "PENDIENTE" : boardingPass.status === "BOARDED" ? "ABORDÓ" : "EXPIRADO"}
              </span>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Token</p>
              <p className="text-gray-900 text-xs font-mono truncate">{boardingPass.qrToken}</p>
            </div>
          </div>

          {boardingPass.status === "ISSUED" && (
            <div className="p-6 bg-gray-50 border-t">
              {actionError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-3">
                  {actionError}
                </div>
              )}
              <button
                type="button"
                onClick={handleBoard}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:opacity-50 text-base"
              >
                {isSubmitting ? "Procesando..." : "Confirmar Abordaje"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
