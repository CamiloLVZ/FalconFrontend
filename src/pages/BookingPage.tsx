import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Flight } from "../types/flight";
import type { BookingPassenger, FlightQuote, PaymentResponse, SeatClass } from "../types/booking";
import { getFlightById, getFlightQuote, processPayment } from "../services/bookingService";
import { getAllCountries } from "../services/countryService";
import type { Country } from "../types/country";
import { formatDuration, getArrivalTime } from "../utils/date-times";
import { AirplaneDepartureIcon } from "../components/icons/AirplaneDepartureIcon";
import { AirplaneArrivalIcon } from "../components/icons/AirplaneArrivalIcon";
import { AirplaneIcon } from "../components/icons/AirplaneIcon";
import { TrashIcon } from "../components/icons/TrashIcon";
import { LoadingScreen } from "../components/common/LoadingScreen";
import imgLogo from "../assets/logo/logo.png";

type Step = 1 | 2 | 3 | 4;

const emptyPassenger = (seatClass: SeatClass): BookingPassenger => ({
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  identificationNumber: "",
  nationalityIsoCode: "",
  passportNumber: "",
  seatClass,
});

export const BookingPage = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [quote, setQuote] = useState<FlightQuote | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);

  const [contactEmail, setContactEmail] = useState("");
  const [seatClass, setSeatClass] = useState<SeatClass>("ECONOMY");
  const [passengers, setPassengers] = useState<BookingPassenger[]>([emptyPassenger("ECONOMY")]);

  useEffect(() => {
    if (!flightId) return;

    const load = async () => {
      try {
        setLoading(true);
        const id = Number(flightId);
        const [flightData, quoteData, countriesData] = await Promise.all([
          getFlightById(id),
          getFlightQuote(id),
          getAllCountries(),
        ]);
        setFlight(flightData);
        setQuote(quoteData);
        setCountries(countriesData);
      } catch {
        setError("Error al cargar la información del vuelo");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [flightId]);

  const hasFirstClass = (flight?.airplaneType.firstClassSeats ?? 0) > 0;

  useEffect(() => {
    if (!hasFirstClass && seatClass === "FIRST_CLASS") {
      setSeatClass("ECONOMY");
      setPassengers((prev) => prev.map((p) => ({ ...p, seatClass: "ECONOMY" as SeatClass })));
    }
  }, [hasFirstClass, seatClass]);

  const updatePassenger = (index: number, field: keyof BookingPassenger, value: string) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addPassenger = () => {
    setPassengers((prev) => [...prev, emptyPassenger(seatClass)]);
  };

  const removePassenger = (index: number) => {
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSeatClassChange = (sc: SeatClass) => {
    setSeatClass(sc);
    setPassengers((prev) => prev.map((p) => ({ ...p, seatClass: sc })));
  };

  const validateStep1 = () => {
    if (!contactEmail.trim()) {
      setError("Ingresa un correo electrónico de contacto");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      setError("Ingresa un correo electrónico válido");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName.trim()) {
        setError(`Pasajero ${i + 1}: Ingresa el nombre`);
        return false;
      }
      if (!p.lastName.trim()) {
        setError(`Pasajero ${i + 1}: Ingresa el apellido`);
        return false;
      }
      if (!p.dateOfBirth) {
        setError(`Pasajero ${i + 1}: Ingresa la fecha de nacimiento`);
        return false;
      }
      if (!p.identificationNumber.trim()) {
        setError(`Pasajero ${i + 1}: Ingresa el número de identificación`);
        return false;
      }
      if (!p.nationalityIsoCode) {
        setError(`Pasajero ${i + 1}: Selecciona la nacionalidad`);
        return false;
      }
    }
    return true;
  };

  const handleNextToStep2 = () => {
    setError(null);
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleNextToStep3 = () => {
    setError(null);
    if (!validateStep2()) return;
    setStep(3);
  };

  const handlePayment = async () => {
    try {
      setError(null);
      setSubmitting(true);

      const response = await processPayment({
        flightId: Number(flightId),
        contactEmail,
        passengers: passengers.map((p) => ({
          passenger: {
            firstName: p.firstName,
            lastName: p.lastName,
            gender: p.gender || undefined,
            dateOfBirth: p.dateOfBirth,
            identificationNumber: p.identificationNumber,
            nationalityIsoCode: p.nationalityIsoCode,
            passportNumber: p.passportNumber || undefined,
          },
          seatClass: p.seatClass,
        })),
      });

      setPaymentResult(response);
      setStep(4);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message ?? "Error al procesar el pago");
      } else {
        setError("Error al procesar el pago");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const unitPrice = seatClass === "ECONOMY" ? quote?.priceEconomy : quote?.priceFirstClass;
  const totalAmount = unitPrice ? unitPrice * passengers.length : 0;

  if (loading) return <LoadingScreen />;

  if (error && !flight) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4 max-w-md">
          <span className="text-2xl flex-shrink-0">⚠</span>
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 cursor-pointer"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-blue-50 min-h-screen px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 ${step > s ? "bg-yellow-400" : "bg-gray-300"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Confirmar vuelo</h2>

              {flight && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">{flight.flightNumber}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="flex justify-center mb-1 text-gray-400">
                        <AirplaneDepartureIcon />
                      </div>
                      <p className="text-xl font-semibold">{flight.localDepartureDateTime.slice(11, 16)}</p>
                      <p className="text-sm text-gray-800 font-medium">{flight.origin}</p>
                    </div>

                    <div className="flex-1 mx-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">{formatDuration(flight.durationMinutes)}</p>
                      <div className="flex items-center">
                        <div className="h-[2px] bg-gray-300 flex-1" />
                        <span className="mx-2 rotate-45 text-gray-400"><AirplaneIcon /></span>
                        <div className="h-[2px] bg-gray-300 flex-1" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Directo</p>
                    </div>

                    <div className="text-center">
                      <div className="flex justify-center mb-1 text-gray-400">
                        <AirplaneArrivalIcon />
                      </div>
                      <p className="text-xl font-semibold">{getArrivalTime(flight.localDepartureDateTime, flight.durationMinutes)}</p>
                      <p className="text-sm text-gray-800 font-medium">{flight.destination}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                    <p><span className="font-medium">Fecha:</span> {flight.localDepartureDateTime.slice(0, 10)}</p>
                    <p><span className="font-medium">Aeronave:</span> {flight.airplaneType.producer} {flight.airplaneType.model}</p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Clase</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSeatClassChange("ECONOMY")}
                    className={`flex-1 p-3 rounded-xl border-2 text-center cursor-pointer transition ${
                      seatClass === "ECONOMY"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold">Económica</p>
                    <p className="text-lg font-bold text-yellow-600">
                      ${quote?.priceEconomy?.toLocaleString() ?? "—"}
                    </p>
                  </button>
                  {hasFirstClass && (
                    <button
                      onClick={() => handleSeatClassChange("FIRST_CLASS")}
                      className={`flex-1 p-3 rounded-xl border-2 text-center cursor-pointer transition ${
                        seatClass === "FIRST_CLASS"
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold">Primera clase</p>
                      <p className="text-lg font-bold text-yellow-600">
                        ${quote?.priceFirstClass?.toLocaleString() ?? "—"}
                      </p>
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico de contacto
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4">
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleNextToStep2}
                className="w-full py-3 bg-yellow-400 text-black rounded-xl font-semibold text-lg hover:bg-yellow-300 transition cursor-pointer"
              >
                Continuar
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Pasajeros</h2>
                <button
                  onClick={addPassenger}
                  disabled={passengers.length >= 9}
                  className={`px-4 py-2 text-sm rounded-xl transition font-medium cursor-pointer ${
                    passengers.length >= 9
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  + Agregar pasajero
                </button>
              </div>

              {passengers.map((passenger, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-700">Pasajero {index + 1}</h3>
                    {passengers.length > 1 && (
                      <button
                        onClick={() => removePassenger(index)}
                        className="text-red-500 hover:text-red-700 transition cursor-pointer p-1"
                        title="Eliminar pasajero"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => updatePassenger(index, "firstName", e.target.value)}
                        placeholder="Nombre"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Apellido *</label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => updatePassenger(index, "lastName", e.target.value)}
                        placeholder="Apellido"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Género</label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => updatePassenger(index, "gender", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      >
                        <option value="">Seleccionar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de nacimiento *</label>
                      <input
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) => updatePassenger(index, "dateOfBirth", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Identificación *</label>
                      <input
                        type="text"
                        value={passenger.identificationNumber}
                        onChange={(e) => updatePassenger(index, "identificationNumber", e.target.value)}
                        placeholder="Número de identificación"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nacionalidad *</label>
                      <select
                        value={passenger.nationalityIsoCode}
                        onChange={(e) => updatePassenger(index, "nationalityIsoCode", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      >
                        <option value="">Seleccionar</option>
                        {countries.map((c) => (
                          <option key={c.isoCode} value={c.isoCode}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Pasaporte</label>
                      <input
                        type="text"
                        value={passenger.passportNumber}
                        onChange={(e) => updatePassenger(index, "passportNumber", e.target.value)}
                        placeholder="Número de pasaporte (opcional)"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4">
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  onClick={handleNextToStep3}
                  className="flex-1 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition cursor-pointer"
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Resumen y pago</h2>

              {flight && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Vuelo</h3>
                  <p className="text-sm">
                    {flight.origin} → {flight.destination}
                  </p>
                  <p className="text-sm text-gray-600">
                    {flight.localDepartureDateTime.slice(0, 10)} - {flight.localDepartureDateTime.slice(11, 16)}
                  </p>
                  <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Pasajeros ({passengers.length})
                </h3>
                {passengers.map((p, i) => (
                  <div key={i} className="text-sm flex justify-between py-1">
                    <span>
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-gray-500">
                      {p.seatClass === "ECONOMY" ? "Económica" : "Primera clase"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {unitPrice?.toLocaleString()} por pasajero
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4">
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  onClick={handlePayment}
                  disabled={submitting}
                  className={`flex-1 py-3 rounded-xl font-semibold text-lg transition cursor-pointer ${
                    submitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-yellow-400 text-black hover:bg-yellow-300"
                  }`}
                >
                  {submitting ? "Procesando..." : "Pagar"}
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-green-600">✓</span>
              </div>

              <h2 className="text-2xl font-bold mb-2">Reserva confirmada</h2>

              {paymentResult && (
                <>
                  <div className="bg-gray-50 rounded-xl p-6 my-6">
                    <p className="text-sm text-gray-500 mb-1">Código de reserva</p>
                    <p className="text-3xl font-bold tracking-widest text-yellow-600">
                      {paymentResult.reservationNumber}
                    </p>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Total pagado: <span className="font-semibold">${paymentResult.totalAmount.toLocaleString()}</span></p>
                    <p>Estado: <span className="text-green-600 font-semibold">APROBADO</span></p>
                    <p className="text-xs text-gray-400">
                      {new Date(paymentResult.processedAt).toLocaleString()}
                    </p>
                  </div>
                </>
              )}

              <button
                onClick={() => navigate("/")}
                className="mt-8 px-8 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition cursor-pointer"
              >
                Volver al inicio
              </button>
            </div>
          )}
        </div>
      </div>

      {submitting && (
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
          <p className="text-lg font-semibold text-gray-700 mt-4">Procesando pago...</p>
          <style>{`@keyframes fillAnimation { 0%,100% { opacity: 0.1; } 50% { opacity: 0.4; } }`}</style>
        </div>
      )}
    </div>
  );
};
