import { useEffect, useState } from "react";
import axios from "axios";
import { AirportTable } from "../components/AirportTable";
import { AdminDrawer } from "../../../components/AdminDrawer";
import type { Airport } from "../types/airportTypes";
import { getAllAirports, createAirport, createCountry } from "../services/airportService";
import type { CreateAirportData, CreateCountryData } from "../services/airportService";
import type { ApiErrorResponse } from "../../../../types/ApiError";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { Pagination } from "../../../components/Pagination";

export const AdminAirportsPage = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [countryFilter, setCountryFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // Create airport state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create country state
  const [isCreateCountryOpen, setIsCreateCountryOpen] = useState(false);
  const [countryCreateData, setCountryCreateData] = useState<CreateCountryData>({
    name: "",
    isoCode: "",
  });
  const [countryCreateSubmitting, setCountryCreateSubmitting] = useState(false);
  const [countryCreateError, setCountryCreateError] = useState<string | null>(null);
  const [createData, setCreateData] = useState<CreateAirportData>({
    iataCode: "",
    name: "",
    city: "",
    countryIsoCode: "",
    timezone: "",
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const getApiErrorMessage = (unknownError: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(unknownError)) {
      return unknownError.response?.data.message ?? fallback;
    }
    return "Ha ocurrido un error inesperado.";
  };

  const loadAirports = async (
    page: number,
    size: number,
    country?: string,
    search?: string,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAirports(size, page, country, search);
      setAirports(data.content);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error(err);
      setError(
        "No se han podido cargar los aeropuertos. Por favor, inténtalo de nuevo más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAirports(currentPage, pageSize, countryFilter || undefined, searchFilter || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(0);
    loadAirports(0, pageSize, countryFilter || undefined, searchFilter || undefined);
  };

  const handleClearFilters = () => {
    setCountryFilter("");
    setSearchFilter("");
    setCurrentPage(0);
    loadAirports(0, pageSize);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  if (error) {
    return (
      <ErrorScreen messageTitle="Error al cargar aeropuertos" message={error} />
    );
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Airports</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCountryCreateData({ name: "", isoCode: "" });
              setCountryCreateError(null);
              setIsCreateCountryOpen(true);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
          >
            + Crear País
          </button>
          <button
            onClick={() => {
              setCreateData({ iataCode: "", name: "", city: "", countryIsoCode: "", timezone: "" });
              setCreateError(null);
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium"
          >
            + Crear Aeropuerto
          </button>
          <button
            onClick={() => loadAirports(currentPage, pageSize, countryFilter || undefined, searchFilter || undefined)}
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

      <div className="bg-white border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-gray-700">Buscar</label>
          <input
            type="text"
            placeholder="Nombre o código IATA"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-sm font-medium text-gray-700">País (ISO)</label>
          <input
            type="text"
            maxLength={2}
            placeholder="Ej: CO"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            Buscar
          </button>
          <button
            onClick={handleClearFilters}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : (
          <AirportTable
            airports={airports}
            onEdit={(a) => {
              setSelectedAirport(a);
              setIsDrawerOpen(true);
            }}
          />
        )}
      </div>

      <AdminDrawer
        title={
          selectedAirport
            ? `Aeropuerto ${selectedAirport.iataCode}`
            : "Aeropuerto"
        }
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedAirport && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
                Detalles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">IATA</p>
                  <p className="text-gray-900">{selectedAirport.iataCode}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Nombre</p>
                  <p className="text-gray-900">{selectedAirport.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Ciudad</p>
                  <p className="text-gray-900">{selectedAirport.city}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">País</p>
                  <p className="text-gray-900">
                    {selectedAirport.country.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Timezone</p>
                  <p className="text-gray-900">{selectedAirport.timezone}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>

      <AdminDrawer
        title="Crear País"
        isOpen={isCreateCountryOpen}
        onClose={() => setIsCreateCountryOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setCountryCreateSubmitting(true);
              setCountryCreateError(null);
              await createCountry(countryCreateData);
              setIsCreateCountryOpen(false);
            } catch (err) {
              setCountryCreateError(
                getApiErrorMessage(err, "No se pudo crear el país."),
              );
            } finally {
              setCountryCreateSubmitting(false);
            }
          }}
          className="space-y-4"
        >
          {countryCreateError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {countryCreateError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={100}
              required
              placeholder="Ej: Colombia"
              value={countryCreateData.name}
              onChange={(e) =>
                setCountryCreateData({ ...countryCreateData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código ISO <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={2}
              required
              placeholder="Ej: CO"
              value={countryCreateData.isoCode}
              onChange={(e) =>
                setCountryCreateData({ ...countryCreateData, isoCode: e.target.value.toUpperCase() })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary uppercase"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateCountryOpen(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={countryCreateSubmitting}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
            >
              {countryCreateSubmitting ? "Creando..." : "Crear País"}
            </button>
          </div>
        </form>
      </AdminDrawer>

      <AdminDrawer
        title="Crear Aeropuerto"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setCreateSubmitting(true);
              setCreateError(null);
              await createAirport(createData);
              setIsCreateOpen(false);
              loadAirports(0, pageSize);
              setCurrentPage(0);
            } catch (err) {
              setCreateError(
                getApiErrorMessage(err, "No se pudo crear el aeropuerto."),
              );
            } finally {
              setCreateSubmitting(false);
            }
          }}
          className="space-y-4"
        >
          {createError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código IATA <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={3}
              required
              placeholder="Ej: CTG"
              value={createData.iataCode}
              onChange={(e) =>
                setCreateData({ ...createData, iataCode: e.target.value.toUpperCase() })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={150}
              required
              placeholder="Ej: Aeropuerto Internacional Rafael Núñez"
              value={createData.name}
              onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={150}
              required
              placeholder="Ej: Cartagena"
              value={createData.city}
              onChange={(e) => setCreateData({ ...createData, city: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País (ISO) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={2}
              required
              placeholder="Ej: CO"
              value={createData.countryIsoCode}
              onChange={(e) =>
                setCreateData({ ...createData, countryIsoCode: e.target.value.toUpperCase() })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona Horaria <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={20}
              required
              placeholder="Ej: America/Bogota"
              value={createData.timezone}
              onChange={(e) => setCreateData({ ...createData, timezone: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createSubmitting}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium disabled:opacity-50"
            >
              {createSubmitting ? "Creando..." : "Crear Aeropuerto"}
            </button>
          </div>
        </form>
      </AdminDrawer>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </section>
  );
};
