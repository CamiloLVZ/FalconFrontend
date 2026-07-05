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
  updatePassengerPassport,
} from "../services/passengerService";
import type { Passenger, PassengerSearchMode } from "../types/passengerTypes";

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
  const [newPassportNumber, setNewPassportNumber] = useState("");

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
    setIsDrawerOpen(true);
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
      setIsDrawerOpen(false);
    } catch (err) {
      setActionError(
        getApiErrorMessage(err, "No se pudo actualizar el pasaporte."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPagination = searchMode === "all" || searchMode === "by-flight";

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Pasajeros</h1>
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
          <div className="flex gap-2 items-end">
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
          <div className="flex gap-2 items-end">
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
              <div className="grid grid-cols-2 gap-4 text-sm">
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
