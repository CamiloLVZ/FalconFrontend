import { useEffect, useState } from "react";
import axios from "axios";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { Pagination } from "../../../components/Pagination";
import { AdminDrawer } from "../../../components/AdminDrawer";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { PassengerTable } from "../components/PassengerTable";
import {
  getAllPassengers,
  getPassengersByFlight,
  getPassengerByPassport,
  getPassengerByIdentification,
  getPassengerReservations,
  createPassenger,
  updatePassengerPassport,
} from "../services/passengerService";
import type { Passenger, PassengerSearchMode, CreatePassengerRequest } from "../types/passengerTypes";
import type { Reservation } from "../../reservations/types/reservationTypes";

export const AdminPassengersPage = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(
    null,
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Search state
  const [searchMode, setSearchMode] = useState<PassengerSearchMode>("all");
  const [flightIdInput, setFlightIdInput] = useState("");
  const [passportInput, setPassportInput] = useState("");
  const [identificationInput, setIdentificationInput] = useState("");
  const [countryCodeInput, setCountryCodeInput] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [newPassportNumber, setNewPassportNumber] = useState("");

  // Upcoming reservations state
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return unknownError.response?.data.message ?? fallback;
    }
    return "Ha ocurrido un error inesperado.";
  };

  const loadPassengers = async (
    page: number,
    size: number,
    modeOverride?: PassengerSearchMode,
  ) => {
    const mode = modeOverride ?? searchMode;
    try {
      setLoading(true);
      setError(null);
      if (mode === "all") {
        const data = await getAllPassengers(page, size);
        setPassengers(data.content);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else if (mode === "by-flight") {
        const id = parseInt(flightIdInput, 10);
        if (isNaN(id)) {
          setError("Ingrese un ID de vuelo válido.");
          return;
        }
        const data = await getPassengersByFlight(id, page, size);
        setPassengers(data.content);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      }
    } catch (err) {
      console.error(err);
      setError("No se han podido cargar los pasajeros.");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(0);
      setTotalPages(1);
      setTotalElements(1);

      if (searchMode === "by-passport") {
        if (!passportInput.trim()) {
          setError("Ingrese un número de pasaporte.");
          return;
        }
        const passenger = await getPassengerByPassport(passportInput.trim());
        setPassengers([passenger]);
      } else if (searchMode === "by-identification") {
        if (!identificationInput.trim() || !countryCodeInput.trim()) {
          setError("Ingrese el número de identificación y el código de país.");
          return;
        }
        const passenger = await getPassengerByIdentification(
          identificationInput.trim(),
          countryCodeInput.trim().toUpperCase(),
        );
        setPassengers([passenger]);
      }
    } catch (err) {
      console.error(err);
      const msg = getApiErrorMessage(err, "No se encontró el pasajero.");
      setError(msg);
      setPassengers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all passengers on mount and when page/size changes in "all" mode
  useEffect(() => {
    if (searchMode === "all") {
      loadPassengers(currentPage, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // Reset passengers and pagination when switching modes
  const handleModeChange = (mode: PassengerSearchMode) => {
    setSearchMode(mode);
    setPassengers([]);
    setError(null);
    setCurrentPage(0);
    setTotalPages(0);
    setTotalElements(0);
    if (mode === "all") {
      // use mode override to avoid reading stale `searchMode` value
      loadPassengers(0, pageSize, mode);
    }
  };

  const handleFlightSearch = () => {
    setCurrentPage(0);
    loadPassengers(0, pageSize);
  };

  const handleEditClick = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setNewPassportNumber(passenger.passportNumber ?? "");
    setActionError(null);
    setUpcomingReservations([]);
    setIsDrawerOpen(true);
    loadUpcomingReservations(passenger);
  };

  const loadUpcomingReservations = async (passenger: Passenger) => {
    try {
      setReservationsLoading(true);
      const data = await getPassengerReservations(
        passenger.identificationNumber,
        passenger.nationalityIsoCode,
        0,
        3,
      );
      const sorted = data.content.sort(
        (a, b) =>
          new Date(a.flight.departureDateTime).getTime() -
          new Date(b.flight.departureDateTime).getTime(),
      );
      setUpcomingReservations(sorted.slice(0, 3));
    } catch {
      setUpcomingReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  };

  const handleUpdatePassport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPassenger) return;
    try {
      setIsSubmitting(true);
      setActionError(null);

      const updatedPassenger = await updatePassengerPassport(
        selectedPassenger.identificationNumber,
        selectedPassenger.nationalityIsoCode,
        newPassportNumber,
      );

      setPassengers((prev) =>
        prev.map((p) => (p.id === updatedPassenger.id ? updatedPassenger : p)),
      );
      setActionError(null);
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "No se pudo actualizar el pasaporte."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPagination = searchMode === "all" || searchMode === "by-flight";

  // Refresh: re-run current search
  const handleRefresh = () => {
    if (searchMode === "all" || searchMode === "by-flight") {
      loadPassengers(currentPage, pageSize);
    } else {
      handleSingleSearch();
    }
  };

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Pasajeros</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCreateError(null);
              setIsCreateDrawerOpen(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium"
          >
            + Crear Pasajero
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Refrescar"
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Controls */}
      <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {(
            [
              { mode: "all", label: "Todos" },
              { mode: "by-flight", label: "Por Vuelo" },
              { mode: "by-passport", label: "Por Pasaporte" },
              { mode: "by-identification", label: "Por Identificación" },
            ] as { mode: PassengerSearchMode; label: string }[]
          ).map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                searchMode === mode
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {searchMode === "by-flight" && (
          <div className="flex gap-2 items-end flex-wrap">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Vuelo
              </label>
              <input
                type="number"
                placeholder="Ej: 12"
                value={flightIdInput}
                onChange={(e) => setFlightIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFlightSearch()}
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              onClick={handleFlightSearch}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
            >
              Buscar
            </button>
          </div>
        )}

        {searchMode === "by-passport" && (
          <div className="flex gap-2 items-end flex-wrap">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Pasaporte
              </label>
              <input
                type="text"
                placeholder="Ej: A1234567"
                value={passportInput}
                onChange={(e) => setPassportInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSingleSearch()}
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              onClick={handleSingleSearch}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
            >
              Buscar
            </button>
          </div>
        )}

        {searchMode === "by-identification" && (
          <div className="flex gap-2 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Identificación
              </label>
              <input
                type="text"
                placeholder="Ej: 1032456789"
                value={identificationInput}
                onChange={(e) => setIdentificationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSingleSearch()}
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País (ISO)
              </label>
              <input
                type="text"
                placeholder="Ej: CO"
                maxLength={2}
                value={countryCodeInput}
                onChange={(e) =>
                  setCountryCodeInput(e.target.value.toUpperCase())
                }
                onKeyDown={(e) => e.key === "Enter" && handleSingleSearch()}
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary uppercase"
              />
            </div>
            <button
              onClick={handleSingleSearch}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
            >
              Buscar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : (
          <PassengerTable passengers={passengers} onEdit={handleEditClick} />
        )}
      </div>

      {showPagination && !loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurrentPage(page);
            loadPassengers(page, pageSize);
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(0);
            loadPassengers(0, size);
          }}
        />
      )}

      <AdminDrawer
        title="Crear Pasajero"
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const data: CreatePassengerRequest = {
              firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value,
              lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
              gender: (form.elements.namedItem("gender") as HTMLSelectElement).value as "M" | "F" | "O",
              nationalityIsoCode: (form.elements.namedItem("nationality") as HTMLInputElement).value.toUpperCase(),
              dateOfBirth: (form.elements.namedItem("dateOfBirth") as HTMLInputElement).value,
              identificationNumber: (form.elements.namedItem("identificationNumber") as HTMLInputElement).value,
              passportNumber: (form.elements.namedItem("passportNumber") as HTMLInputElement).value || undefined,
            };
            try {
              setCreateSubmitting(true);
              setCreateError(null);
              await createPassenger(data);
              setIsCreateDrawerOpen(false);
              handleRefresh();
            } catch (err) {
              setCreateError(getApiErrorMessage(err, "No se pudo crear el pasajero."));
            } finally {
              setCreateSubmitting(false);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
            <input name="firstName" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido <span className="text-red-500">*</span></label>
            <input name="lastName" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Género <span className="text-red-500">*</span></label>
            <select name="gender" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm">
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nacionalidad (ISO) <span className="text-red-500">*</span></label>
            <input name="nationality" placeholder="Ej: CO" maxLength={2} required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento <span className="text-red-500">*</span></label>
            <input name="dateOfBirth" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de identificación <span className="text-red-500">*</span></label>
            <input name="identificationNumber" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de pasaporte</label>
            <input name="passportNumber" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsCreateDrawerOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancelar</button>
            <button type="submit" disabled={createSubmitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50">{createSubmitting ? "Creando..." : "Crear"}</button>
          </div>
          {createError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">{createError}</div>}
        </form>
      </AdminDrawer>

      <AdminDrawer
        title={
          selectedPassenger
            ? `Pasajero: ${selectedPassenger.firstName} ${selectedPassenger.lastName}`
            : "Pasajero"
        }
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedPassenger && (
          <div className="space-y-6">
            {/* Detalles del Pasajero */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                Detalles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Nombre Completo</p>
                  <p className="text-gray-900">
                    {selectedPassenger.firstName} {selectedPassenger.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">ID de Pasajero</p>
                  <p className="text-gray-900">{selectedPassenger.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Identificación</p>
                  <p className="text-gray-900">
                    {selectedPassenger.identificationNumber}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Nacionalidad</p>
                  <p className="text-gray-900">
                    {selectedPassenger.nationalityIsoCode}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">
                    Fecha de Nacimiento
                  </p>
                  <p className="text-gray-900">
                    {selectedPassenger.dateOfBirth}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Género</p>
                  <p className="text-gray-900">{selectedPassenger.gender}</p>
                </div>
              </div>
            </div>

            {/* Próximas Reservas */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                Próximas Reservas
              </h3>
              {reservationsLoading ? (
                <p className="text-sm text-gray-500">Cargando...</p>
              ) : upcomingReservations.length === 0 ? (
                <p className="text-sm text-gray-500">No se encontraron reservas próximas.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingReservations.map((r) => (
                    <div
                      key={r.number}
                      className="text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{r.flight.flightNumber}</p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.status === "RESERVED"
                              ? "bg-green-100 text-green-800"
                              : r.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.flight.origin} → {r.flight.destination} |{" "}
                        {new Date(r.flight.departureDateTime).toLocaleDateString()}{" "}
                        {new Date(r.flight.departureDateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        Reserva: {r.number} | {r.passengers.length} pasajero(s)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actualizar Pasaporte */}
            <form
              onSubmit={handleUpdatePassport}
              className="bg-gray-50 p-4 rounded-lg border"
            >
              <h3 className="font-semibold text-gray-800 mb-3">
                Actualizar Pasaporte
              </h3>
              {actionError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-3">
                  {actionError}
                </div>
              )}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Número de Pasaporte"
                  value={newPassportNumber}
                  onChange={(e) => setNewPassportNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  required
                />
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    newPassportNumber === selectedPassenger.passportNumber
                  }
                  className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Actualizando..." : "Guardar Pasaporte"}
                </button>
              </div>
            </form>
          </div>
        )}
      </AdminDrawer>
    </section>
  );
};
