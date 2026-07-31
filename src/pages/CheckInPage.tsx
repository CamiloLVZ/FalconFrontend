import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { checkInPassenger, getReservation } from "../admin/features/reservations/services/reservationService";
import { downloadBoardingPass } from "../admin/features/boarding/services/boardingService";
import type { CheckInResponse } from "../admin/features/reservations/types/reservationTypes";
import type { ApiErrorResponse } from "../types/ApiError";
import { getAllCountries } from "../services/countryService";
import type { Country } from "../types/country";
import imgLogo from "../assets/logo/logo.png";

export const CheckInPage = () => {
  const [searchParams] = useSearchParams();
  const [reservationNumber, setReservationNumber] = useState(searchParams.get("reservation") || "");
  const [contactEmail, setContactEmail] = useState(searchParams.get("email") || "");
  const [identificationNumber, setIdentificationNumber] = useState(searchParams.get("identification") || "");
  const [countryIsoCode, setCountryIsoCode] = useState(searchParams.get("country") || "");
  const [countries, setCountries] = useState<Country[]>([]);
  const [seatNumber, setSeatNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<CheckInResponse | null>(null);

  useEffect(() => {
    getAllCountries().then(setCountries).catch(() => {});
  }, []);

  const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return unknownError.response?.data.message ?? fallback;
    }
    return "Ha ocurrido un error inesperado.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationNumber || !contactEmail || !identificationNumber || !countryIsoCode) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessData(null);

      const reservation = await getReservation(reservationNumber.trim(), contactEmail.trim());
      const flightStatus = reservation.flight.status;

      if (flightStatus === "BOARDING" || flightStatus === "GATE_CLOSED") {
        setError("El abordaje ya ha comenzado. No se permiten check-ins en este momento.");
        return;
      }

      if (flightStatus === "COMPLETED") {
        setError("Este vuelo ya ha sido completado.");
        return;
      }

      if (flightStatus === "CANCELED") {
        setError("Este vuelo ha sido cancelado.");
        return;
      }

      if (flightStatus === "SCHEDULED") {
        setError("El check-in aún no está disponible para este vuelo.");
        return;
      }

      const result = await checkInPassenger(
        reservationNumber.trim(),
        contactEmail.trim(),
        identificationNumber.trim(),
        countryIsoCode,
        seatNumber.trim() ? parseInt(seatNumber, 10) : undefined,
      );

      setSuccessData(result);
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response?.status === 404) {
        setError("Reserva no encontrada. Verifica los datos ingresados.");
      } else {
        setError(getApiErrorMessage(err, "No se pudo realizar el check-in."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewCheckIn = () => {
    setReservationNumber("");
    setContactEmail("");
    setIdentificationNumber("");
    setCountryIsoCode("");
    setSeatNumber("");
    setSuccessData(null);
    setError(null);
  };

  if (successData) {
    return (
      <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-green-600">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Check-in exitoso</h2>
            <p className="text-gray-500 mb-6">Tu check-in se ha realizado correctamente</p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-2 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Pasajero:</span>{" "}
                {successData.passenger.firstName} {successData.passenger.lastName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Asiento:</span>{" "}
                {successData.seatLabel} ({successData.seatClass === "FIRST_CLASS" ? "Primera clase" : "Económico"})
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Estado:</span>{" "}
                <span className="text-green-600 font-medium">Check-in realizado</span>
              </p>
            </div>

            <button
              onClick={() => downloadBoardingPass(successData.id)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer mb-3"
            >
              Descargar boarding pass
            </button>

            <button
              onClick={handleNewCheckIn}
              className="w-full py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition cursor-pointer"
            >
              Realizar otro check-in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Check-in</h1>
          <p className="text-gray-500 mt-2">Realiza tu check-in online ingresando tus datos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de reserva
              </label>
              <input
                type="text"
                value={reservationNumber}
                onChange={(e) => setReservationNumber(e.target.value)}
                placeholder="Ej: ABC123"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico de contacto
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Ej: contacto@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de identificación del pasajero
              </label>
              <input
                type="text"
                value={identificationNumber}
                onChange={(e) => setIdentificationNumber(e.target.value)}
                placeholder="Ej: 1032456789"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País de identificación
              </label>
              <select
                value={countryIsoCode}
                onChange={(e) => setCountryIsoCode(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
              >
                <option value="">Seleccionar país</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de asiento <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="number"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                placeholder="Dejar en blanco para asignación automática"
                min={1}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-lg transition cursor-pointer ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 text-black hover:bg-yellow-300"
              }`}
            >
              {loading ? "Procesando..." : "Realizar check-in"}
            </button>
          </form>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 bg-white/80 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-24 h-24 overflow-hidden rounded-xl">
                <img src={imgLogo} alt="Falcon logo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-blue-600 opacity-30 animate-pulse" style={{ animation: "fillAnimation 2s ease-in-out infinite" }} />
              </div>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700 mt-4">Procesando check-in...</p>
          <style>{`@keyframes fillAnimation { 0%,100% { opacity: 0.1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      )}
    </div>
  );
};
