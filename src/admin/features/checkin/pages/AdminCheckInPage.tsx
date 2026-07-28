import { useState } from "react";
import axios from "axios";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { checkInPassenger } from "../../reservations/services/reservationService";
import type { CheckInResponse } from "../../reservations/types/reservationTypes";

export const AdminCheckInPage = () => {
  const [reservationNumber, setReservationNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [countryIsoCode, setCountryIsoCode] = useState("");
  const [seatNumber, setSeatNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<CheckInResponse | null>(null);

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

      const result = await checkInPassenger(
        reservationNumber.trim(),
        contactEmail.trim(),
        identificationNumber.trim(),
        countryIsoCode.trim().toUpperCase(),
        seatNumber.trim() ? parseInt(seatNumber, 10) : undefined,
      );

      setSuccessData(result);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo realizar el check-in."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Check-In Manual</h1>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Reserva
            </label>
            <input
              type="text"
              value={reservationNumber}
              onChange={(e) => setReservationNumber(e.target.value)}
              placeholder="Ej: ABC123"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de Contacto
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Ej: contacto@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Identificación del Pasajero
            </label>
            <input
              type="text"
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value)}
              placeholder="Ej: 1032456789"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País (Código ISO)
            </label>
            <input
              type="text"
              value={countryIsoCode}
              onChange={(e) => setCountryIsoCode(e.target.value.toUpperCase())}
              placeholder="Ej: CO"
              maxLength={2}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Asiento <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="number"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              placeholder="Ej: 12 (dejar en blanco para asignación automática)"
              min={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {successData && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm space-y-1">
              <p className="font-semibold">Check-in exitoso</p>
              <p>Pasajero: {successData.passenger.firstName} {successData.passenger.lastName}</p>
              <p>Asiento: {successData.seatLabel} ({successData.seatClass === "FIRST_CLASS" ? "Primera Clase" : "Económico"})</p>
              <p>Estado: {successData.status}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-md disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Realizar Check-In"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
